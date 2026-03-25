import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { openaiAdapter, type ProviderAdapter } from '../../../packages/provider-adapters/src/index.js';
import {
  AUTH_COOKIE_NAME,
  createSession,
  isSessionExpired,
  parseCookies,
  verifyPassword
} from './auth-local.js';
import { loadState, withStateMutation, DEFAULT_STATE_PATH } from './store.js';
import { approvePreExecution, approveRelease, runReleaseCheck, startRun } from './runtime-api.js';
import {
  projectActivityViewModel,
  projectCatalogViewModel,
  projectGovernanceViewModel,
  projectInboxViewModel,
  projectOperateThreadPageViewModel,
  projectOperateWorkspaceViewModel,
  projectRunDetailViewModel,
  projectRunListViewModel,
  projectSettingsViewModel,
  projectWebAppViewModel
} from './projectors.js';
import type { ApiState, ChatRecord, LocalSessionRecord, LocalUserRecord } from './state-types.js';

interface StartOptions {
  port?: number;
  host?: string;
  statePath?: string;
  chatAdapter?: ProviderAdapter;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  const body = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('invalid_json');
  }
}

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload, null, 2));
}

function html(res: ServerResponse, status: number, content: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(content);
}

function sseHeaders(res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
}

function writeSseEvent(res: ServerResponse, event: string, data: unknown, id?: string): void {
  if (id) {
    res.write(`id: ${id}\n`);
  }
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function interactiveHtml(): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Opita Sync Runtime</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; background: #f7f8fa; color: #1f2933; }
      button { margin-right: 8px; margin-top: 8px; }
      .card { background: white; border: 1px solid #d4d8dd; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow: auto; }
    </style>
  </head>
  <body>
    <h1>Opita Sync</h1>
    <p>Flow: intent -> contract -> policy validation -> execution compilation -> durable execution -> output control.</p>
    <div class="card">
      <button id="start">Start governed run</button>
      <button id="release">Run release check</button>
      <button id="approve">Approve release</button>
      <button id="refresh">Refresh model</button>
    </div>
    <div class="card">
      <h2>Latest run</h2>
      <pre id="run">No run yet.</pre>
    </div>
    <div class="card">
      <h2>View model</h2>
      <pre id="model">Loading...</pre>
    </div>

    <script>
      let latestRunId = null;

      async function call(path, method = 'GET', body) {
        const response = await fetch(path, {
          method,
          headers: { 'content-type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        const json = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(json));
        return json;
      }

      async function refresh() {
        const data = await call('/api/view-model');
        document.getElementById('model').textContent = JSON.stringify(data, null, 2);
      }

      document.getElementById('start').onclick = async () => {
        const result = await call('/api/runs/start', 'POST', {
          rawIntent: 'Prepare governed customer follow-up draft',
          approvalMode: 'pre-application'
        });
        latestRunId = result.runId;
        document.getElementById('run').textContent = JSON.stringify(result, null, 2);
        await refresh();
      };

      document.getElementById('release').onclick = async () => {
        if (!latestRunId) return alert('Start a run first');
        const result = await call('/api/runs/' + latestRunId + '/release-check', 'POST', {});
        document.getElementById('run').textContent = JSON.stringify(result, null, 2);
        await refresh();
      };

      document.getElementById('approve').onclick = async () => {
        if (!latestRunId) return alert('Start a run first');
        const result = await call('/api/runs/' + latestRunId + '/approve-release', 'POST', {});
        document.getElementById('run').textContent = JSON.stringify(result, null, 2);
        await refresh();
      };

      document.getElementById('refresh').onclick = refresh;
      refresh();
    </script>
  </body>
</html>`;
}

function legacyRunRecordPayload(record: Awaited<ReturnType<typeof loadState>>['runRecords'][number]) {
  return {
    run: {
      state: record.run.state
    },
    runtimeEvents: record.runtimeEvents.map((event) => ({
      eventType: event.eventType
    }))
  };
}

function nextChatId(state: ApiState): string {
  return `chat_${state.chatRecords.length + 1}`;
}

function toChatPayload(record: ChatRecord) {
  return {
    ok: true,
    chatId: record.chatId,
    status: record.status,
    providerId: record.providerId,
    model: record.model,
    latestAssistantMessage: record.latestAssistantMessage,
    latestProposals: record.latestProposals,
    lastError: record.lastError,
    lastErrorCode: record.lastErrorCode,
    continuityMode: record.providerState?.continuityMode,
    recoverableError: record.providerState?.recoverableError,
    interrupted: record.interrupted,
    stoppedAt: record.stoppedAt,
    stopReason: record.stopReason
  };
}

function buildChatContext(record: ChatRecord) {
  const history = record.history
    .slice(-12)
    .map((entry) => ({ role: entry.role, content: entry.content }));

  if (record.summary?.trim()) {
    history.unshift({
      role: 'assistant',
      content: `Conversation summary: ${record.summary.trim()}`
    });
  }

  return history;
}

function buildGovernedChatInstructions(assets: Array<{
  assetId: string;
  name: string;
  description: string;
  approvalMode: string;
  connectorIds: string[];
}>): string {
  const catalogLines = assets.length
    ? assets.map((asset) => `- ${asset.assetId}: ${asset.name} | ${asset.description} | approval=${asset.approvalMode} | connectors=${asset.connectorIds.join(',') || 'none'}`).join('\n')
    : 'No governed assets are currently available.';

  return [
    'You are the governed planning assistant for Opita Sync.',
    'Interpret the user request and respond with concise operational guidance.',
    'Never claim to execute tools, connectors, workflows, or external actions.',
    'You may only suggest governed assets that already exist in the catalog.',
    'Always provide a short textual interpretation first.',
    'If a catalog asset is a strong fit, you may additionally call propose_governed_action one or more times.',
    'If no governed asset fits, explain that clearly and do not invent one.',
    'Surface governance or approval concerns when relevant.',
    'Available governed assets:',
    catalogLines
  ].join('\n');
}

function setSessionCookie(res: ServerResponse, sessionId: string): void {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Lax; Path=/`);
}

function clearSessionCookie(res: ServerResponse): void {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function getSessionId(req: IncomingMessage): string | undefined {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[AUTH_COOKIE_NAME];
}

function materializeAuthPayload(user: LocalUserRecord, session: LocalSessionRecord) {
  return {
    ok: true,
    user: {
      userId: user.userId,
      tenantId: user.tenantId,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles
    },
    session: {
      sessionId: session.sessionId,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
      lastSeenAt: session.lastSeenAt
    }
  };
}

export async function startApiServer(options: StartOptions = {}) {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? 0;
  const statePath = options.statePath ?? DEFAULT_STATE_PATH;
  const chatAdapter = options.chatAdapter ?? openaiAdapter;
  const globalStreams = new Set<ServerResponse>();
  const runStreams = new Map<string, Set<ServerResponse>>();
  const chatStreams = new Map<string, Set<ServerResponse>>();
  const activeChatRuns = new Map<string, { sequenceNumber: number; stopped: boolean; abortController: AbortController }>();

  function attachStream(set: Set<ServerResponse>, res: ServerResponse, heartbeatEvent: string, heartbeatPayload: unknown) {
    set.add(res);
    sseHeaders(res);
    writeSseEvent(res, 'connected', heartbeatPayload);

    const heartbeat = setInterval(() => {
      try {
        writeSseEvent(res, heartbeatEvent, heartbeatPayload);
      } catch {
        clearInterval(heartbeat);
      }
    }, 25000);

    res.on('close', () => {
      clearInterval(heartbeat);
      set.delete(res);
    });
  }

  function broadcast(set: Set<ServerResponse>, event: string, payload: unknown) {
    for (const stream of set) {
      try {
        writeSseEvent(stream, event, payload);
      } catch {
        set.delete(stream);
      }
    }
  }

  function getActiveChatRun(chatId: string, sequenceNumber?: number) {
    const active = activeChatRuns.get(chatId);
    if (!active) {
      return null;
    }
    if (typeof sequenceNumber === 'number' && active.sequenceNumber !== sequenceNumber) {
      return null;
    }
    return active;
  }

  function isChatStopped(chatId: string, sequenceNumber: number) {
    return Boolean(getActiveChatRun(chatId, sequenceNumber)?.stopped);
  }

  function completeActiveChatRun(chatId: string, sequenceNumber: number) {
    const active = activeChatRuns.get(chatId);
    if (active?.sequenceNumber === sequenceNumber) {
      activeChatRuns.delete(chatId);
    }
  }

  async function getCurrentSession(req: IncomingMessage): Promise<{
    user: LocalUserRecord;
    session: LocalSessionRecord;
  } | null> {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return null;
    }

    const state = await loadState(statePath);
    const session = state.localSessions.find((item) => item.sessionId === sessionId);
    if (!session || isSessionExpired(session)) {
      return null;
    }

    const user = state.localUsers.find((item) => item.userId === session.userId && item.active);
    if (!user) {
      return null;
    }

    return { user, session };
  }

  async function requireAuth(req: IncomingMessage, res: ServerResponse): Promise<{
    user: LocalUserRecord;
    session: LocalSessionRecord;
  } | null> {
    const auth = await getCurrentSession(req);
    if (!auth) {
      clearSessionCookie(res);
      json(res, 401, { ok: false, error: 'auth_required' });
      return null;
    }
    return auth;
  }

  async function updateChatRecord(
    chatId: string,
    expectedSequenceNumber: number,
    mutator: (record: ChatRecord) => void
  ): Promise<ChatRecord | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const { result } = await withStateMutation((state) => {
          const record = state.chatRecords.find((item) => item.chatId === chatId);
          if (!record) {
            throw new Error(`chat_not_found:${chatId}`);
          }
          if (record.sequenceNumber !== expectedSequenceNumber) {
            return null;
          }
          if (record.status === 'cancelled') {
            return null;
          }
          mutator(record);
          record.updatedAt = new Date().toISOString();
          return structuredClone(record);
        }, statePath);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('chat_update_failed');
        if (!lastError.message.startsWith('chat_not_found:') || attempt === 2) {
          throw lastError;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }

    throw lastError ?? new Error(`chat_not_found:${chatId}`);
  }

  async function runGovernedChat(chatId: string, sequenceNumber: number): Promise<void> {
    const state = await loadState(statePath);
    const record = state.chatRecords.find((item) => item.chatId === chatId);
    if (!record || record.sequenceNumber !== sequenceNumber || record.status === 'cancelled') {
      completeActiveChatRun(chatId, sequenceNumber);
      return;
    }

    const assets = state.catalog.map((asset) => ({
      assetId: asset.assetId,
      name: asset.name,
      description: asset.description,
      approvalMode: asset.approvalMode,
      connectorIds: asset.connectorIds
    }));

    try {
      for await (const event of chatAdapter.streamChat({
        history: buildChatContext(record),
        governedInstructions: buildGovernedChatInstructions(assets),
        assets,
        providerStateHint: {
          lastResponseId: record.providerState?.lastResponseId,
          canResumeProviderState: Boolean(record.providerState?.storeEnabled && record.providerState?.lastResponseId)
        },
        abortSignal: getActiveChatRun(chatId, sequenceNumber)?.abortController.signal
      })) {
        if (isChatStopped(chatId, sequenceNumber)) {
          completeActiveChatRun(chatId, sequenceNumber);
          return;
        }
        const chatSet = chatStreams.get(chatId);

        if (event.type === 'started') {
          const updated = await updateChatRecord(chatId, sequenceNumber, (current) => {
            current.status = 'streaming';
            current.model = event.model ?? current.model;
            current.lastError = undefined;
            current.providerState = {
              lastResponseId: event.responseId ?? current.providerState?.lastResponseId,
              lastRequestId: event.requestId ?? current.providerState?.lastRequestId,
              storeEnabled: current.providerState?.storeEnabled ?? false,
              continuityMode: event.continuityMode ?? current.providerState?.continuityMode ?? 'manual',
              recoverableError: undefined
            };
          });
          if (!updated) {
            return;
          }
          if (chatSet) {
            broadcast(chatSet, 'chat.started', {
              ...toChatPayload(updated),
              responseId: updated.providerState?.lastResponseId
            });
          }
          continue;
        }

        if (event.type === 'delta') {
          const updated = await updateChatRecord(chatId, sequenceNumber, (current) => {
            current.status = 'streaming';
            current.lastStreamingCheckpoint = current.latestAssistantMessage;
            current.latestAssistantMessage += event.delta;
          });
          if (!updated) {
            return;
          }
          if (chatSet) {
            broadcast(chatSet, 'chat.delta', {
              chatId,
              delta: event.delta,
              fullText: updated.latestAssistantMessage
            });
          }
          continue;
        }

        if (event.type === 'tool_proposals') {
          const updated = await updateChatRecord(chatId, sequenceNumber, (current) => {
            current.latestProposals = [...current.latestProposals, ...event.proposals];
          });
          if (!updated) {
            return;
          }
          if (chatSet) {
            broadcast(chatSet, 'chat.tool_proposals', {
              chatId,
              proposals: event.proposals,
              allProposals: updated.latestProposals
            });
          }
          continue;
        }

        if (event.type === 'completed') {
          const updated = await updateChatRecord(chatId, sequenceNumber, (current) => {
            current.status = 'completed';
            current.model = event.model ?? current.model;
            current.latestAssistantMessage = event.text || current.latestAssistantMessage;
            current.lastStreamingCheckpoint = undefined;
            current.latestProposals = event.proposals;
            current.lastError = undefined;
            current.providerState = {
              lastResponseId: event.responseId ?? current.providerState?.lastResponseId,
              lastRequestId: event.requestId ?? current.providerState?.lastRequestId,
              storeEnabled: current.providerState?.storeEnabled ?? false,
              continuityMode: event.continuityMode ?? current.providerState?.continuityMode ?? 'manual',
              recoverableError: event.recoverableError
            };
            if (current.latestAssistantMessage) {
              current.history.push({
                role: 'assistant',
                content: current.latestAssistantMessage,
                createdAt: new Date().toISOString()
              });
            }
          });
          if (!updated) {
            return;
          }
          if (chatSet) {
            broadcast(chatSet, 'chat.completed', {
              ...toChatPayload(updated),
              responseId: updated.providerState?.lastResponseId
            });
          }
          completeActiveChatRun(chatId, sequenceNumber);
          return;
        }

        if (event.type === 'error') {
          const updated = await updateChatRecord(chatId, sequenceNumber, (current) => {
            current.status = 'failed';
            current.lastError = event.message;
            current.lastErrorCode = event.code;
            current.providerState = {
              lastResponseId: current.providerState?.lastResponseId,
              lastRequestId: event.requestId ?? current.providerState?.lastRequestId,
              storeEnabled: current.providerState?.storeEnabled ?? false,
              continuityMode: current.providerState?.continuityMode ?? 'manual',
              recoverableError: event.recoverable ? event.message : current.providerState?.recoverableError
            };
          });
          if (!updated) {
            return;
          }
          if (chatSet) {
            broadcast(chatSet, 'chat.error', {
              ...toChatPayload(updated),
              error: event.message
            });
          }
          completeActiveChatRun(chatId, sequenceNumber);
          return;
        }
      }
      completeActiveChatRun(chatId, sequenceNumber);
    } catch (error) {
      if (isChatStopped(chatId, sequenceNumber)) {
        completeActiveChatRun(chatId, sequenceNumber);
        return;
      }
      if (error instanceof Error && error.message.startsWith('chat_not_found:')) {
        completeActiveChatRun(chatId, sequenceNumber);
        return;
      }
      const updated = await updateChatRecord(chatId, sequenceNumber, (current) => {
        current.status = 'failed';
        current.lastError = error instanceof Error ? error.message : 'chat_failed';
        current.lastErrorCode = 'provider_transient_failure';
      });
      if (!updated) {
        completeActiveChatRun(chatId, sequenceNumber);
        return;
      }
      const chatSet = chatStreams.get(chatId);
      if (chatSet) {
        broadcast(chatSet, 'chat.error', {
          ...toChatPayload(updated),
          error: updated.lastError
        });
      }
      completeActiveChatRun(chatId, sequenceNumber);
    }
  }

  const server = createServer(async (req, res) => {
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', `http://${host}:${port}`);
    let authenticatedUser: LocalUserRecord | null = null;

    try {
      if (method === 'GET' && url.pathname === '/health') {
        json(res, 200, { ok: true, statePath });
        return;
      }

      if (method === 'POST' && url.pathname === '/api/auth/login') {
        const body = await readBody(req) as { email?: string; password?: string };
        const email = body.email?.trim().toLowerCase();
        const password = body.password ?? '';
        if (!email || !password) {
          json(res, 400, { ok: false, error: 'email_and_password_required' });
          return;
        }

        const { result } = await withStateMutation((state) => {
          const user = state.localUsers.find((item) => item.email.toLowerCase() === email && item.active);
          if (!user || !verifyPassword(user, password)) {
            throw new Error('invalid_credentials');
          }

          state.localSessions = state.localSessions.filter((item) => !isSessionExpired(item));
          const session = createSession(user);
          state.localSessions.push(session);
          state.settings.tenantId = user.tenantId;
          if (!state.settings.tenantName || state.settings.tenantName === 'Tenant 1') {
            state.settings.tenantName = user.tenantId;
          }
          return materializeAuthPayload(user, session);
        }, statePath);

        setSessionCookie(res, result.session.sessionId);
        json(res, 200, result);
        return;
      }

      if (method === 'POST' && url.pathname === '/api/auth/logout') {
        const sessionId = getSessionId(req);
        if (sessionId) {
          await withStateMutation((state) => {
            state.localSessions = state.localSessions.filter((item) => item.sessionId !== sessionId);
          }, statePath);
        }
        clearSessionCookie(res);
        json(res, 200, { ok: true });
        return;
      }

      if (method === 'GET' && url.pathname === '/api/auth/session') {
        const auth = await getCurrentSession(req);
        if (!auth) {
          clearSessionCookie(res);
          json(res, 401, { ok: false, error: 'auth_required' });
          return;
        }
        json(res, 200, materializeAuthPayload(auth.user, auth.session));
        return;
      }

      if (url.pathname.startsWith('/api/')) {
        const auth = await requireAuth(req, res);
        if (!auth) {
          return;
        }
        authenticatedUser = auth.user;
      }

      if (method === 'GET' && url.pathname === '/api/view-model') {
        const state = await loadState(statePath);
        json(res, 200, projectWebAppViewModel(state));
        return;
      }

      if (method === 'GET' && url.pathname === '/api/operate/workspace') {
        const state = await loadState(statePath);
        json(res, 200, projectOperateWorkspaceViewModel(state, url.searchParams.get('runId')));
        return;
      }

      if (method === 'GET' && url.pathname === '/api/operate/thread') {
        const state = await loadState(statePath);
        const rawLimit = Number(url.searchParams.get('limit') ?? '20');
        const limit = Number.isFinite(rawLimit) ? rawLimit : 20;
        json(
          res,
          200,
          projectOperateThreadPageViewModel(
            state,
            url.searchParams.get('runId'),
            url.searchParams.get('before'),
            limit
          )
        );
        return;
      }

      if (method === 'GET' && url.pathname === '/api/catalog') {
        const state = await loadState(statePath);
        json(res, 200, projectCatalogViewModel(state));
        return;
      }

      if (method === 'GET' && url.pathname === '/api/inbox') {
        const state = await loadState(statePath);
        json(res, 200, projectInboxViewModel(state));
        return;
      }

      if (method === 'GET' && url.pathname === '/api/activity') {
        const state = await loadState(statePath);
        json(res, 200, projectActivityViewModel(state));
        return;
      }

      if (method === 'GET' && url.pathname === '/api/governance') {
        const state = await loadState(statePath);
        json(res, 200, projectGovernanceViewModel(state));
        return;
      }

      if (method === 'GET' && url.pathname === '/api/settings') {
        const state = await loadState(statePath);
        json(res, 200, projectSettingsViewModel(state));
        return;
      }

      if (method === 'POST' && url.pathname === '/api/chat/start') {
        const body = await readBody(req) as { message?: string; chatId?: string };
        const message = body.message?.trim();
        if (!message) {
          json(res, 400, { ok: false, error: 'message_required' });
          return;
        }

        const { result } = await withStateMutation((state) => {
          const now = new Date().toISOString();
          const existing = body.chatId ? state.chatRecords.find((item) => item.chatId === body.chatId) : undefined;

          if (existing) {
            existing.sequenceNumber += 1;
            existing.status = 'queued';
            existing.latestUserMessage = message;
            existing.latestAssistantMessage = '';
            existing.lastStreamingCheckpoint = undefined;
            existing.latestProposals = [];
            existing.lastError = undefined;
            existing.lastErrorCode = undefined;
            existing.interrupted = undefined;
            existing.stoppedAt = undefined;
            existing.stopReason = undefined;
            existing.updatedAt = now;
            existing.providerState = {
              lastResponseId: existing.providerState?.lastResponseId,
              lastRequestId: existing.providerState?.lastRequestId,
              storeEnabled: existing.providerState?.storeEnabled ?? false,
              continuityMode: 'manual',
              recoverableError: undefined
            };
            existing.history.push({
              role: 'user',
              content: message,
              createdAt: now
            });
            return {
              chat: toChatPayload(existing),
              sequenceNumber: existing.sequenceNumber
            };
          }

          const record: ChatRecord = {
            chatId: nextChatId(state),
            providerId: chatAdapter.providerId,
            model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
            status: 'queued',
            startedAt: now,
            updatedAt: now,
            sequenceNumber: 0,
            latestUserMessage: message,
            latestAssistantMessage: '',
            lastStreamingCheckpoint: undefined,
            latestProposals: [],
            lastErrorCode: undefined,
            interrupted: undefined,
            stoppedAt: undefined,
            stopReason: undefined,
            providerState: {
              storeEnabled: false,
              continuityMode: 'manual'
            },
            history: [
              {
                role: 'user',
                content: message,
                createdAt: now
              }
            ]
          };

          state.chatRecords.push(record);
          return {
            chat: toChatPayload(record),
            sequenceNumber: record.sequenceNumber
          };
        }, statePath);

        activeChatRuns.set(result.chat.chatId, {
          sequenceNumber: result.sequenceNumber,
          stopped: false,
          abortController: new AbortController()
        });
        void runGovernedChat(result.chat.chatId, result.sequenceNumber);
        json(res, 201, result.chat);
        return;
      }

      const stopChatMatch = method === 'POST' ? url.pathname.match(/^\/api\/chat\/([^/]+)\/stop$/) : null;
      if (stopChatMatch) {
        const chatId = stopChatMatch[1];
        if (!chatId) {
          json(res, 400, { ok: false, error: 'chat_id_required' });
          return;
        }

        const active = activeChatRuns.get(chatId);
        if (active) {
          active.stopped = true;
          active.abortController.abort();
        }
        const { result } = await withStateMutation((state) => {
          const record = state.chatRecords.find((item) => item.chatId === chatId);
          if (!record) {
            throw new Error(`chat_not_found:${chatId}`);
          }
          if (record.status === 'completed' || record.status === 'failed' || record.status === 'cancelled') {
            return structuredClone(record);
          }

          const now = new Date().toISOString();
          record.status = 'cancelled';
          record.updatedAt = now;
          record.interrupted = true;
          record.stoppedAt = now;
          record.stopReason = 'user_stopped';
          record.lastError = undefined;
          record.lastErrorCode = undefined;
          if (
            typeof record.lastStreamingCheckpoint === 'string' &&
            record.lastStreamingCheckpoint.length > 0 &&
            record.latestAssistantMessage !== record.lastStreamingCheckpoint
          ) {
            record.latestAssistantMessage = record.lastStreamingCheckpoint;
          }
          record.lastStreamingCheckpoint = undefined;

          if (record.latestAssistantMessage.trim().length > 0) {
            const latestHistory = record.history.at(-1);
            if (
              !latestHistory ||
              latestHistory.role !== 'assistant' ||
              latestHistory.content !== record.latestAssistantMessage
            ) {
              record.history.push({
                role: 'assistant',
                content: record.latestAssistantMessage,
                createdAt: now
              });
            }
          }

          return structuredClone(record);
        }, statePath);

        const chatSet = chatStreams.get(chatId);
        if (chatSet) {
          broadcast(chatSet, 'chat.cancelled', {
            ...toChatPayload(result),
            responseId: result.providerState?.lastResponseId
          });
        }
        json(res, 200, toChatPayload(result));
        return;
      }

      if (method === 'PATCH' && url.pathname === '/api/settings') {
        const body = await readBody(req) as Partial<{
          tenantId: string;
          tenantName: string;
          defaultEnvironment: 'dev' | 'staging' | 'prod';
          preferredProvider: string;
          connectorNotes: string;
        }>;

        const { result } = await withStateMutation((state) => {
          state.settings = {
            ...state.settings,
            ...(body.tenantId ? { tenantId: body.tenantId } : {}),
            ...(body.tenantName ? { tenantName: body.tenantName } : {}),
            ...(body.defaultEnvironment ? { defaultEnvironment: body.defaultEnvironment } : {}),
            ...(body.preferredProvider ? { preferredProvider: body.preferredProvider } : {}),
            ...(typeof body.connectorNotes === 'string' ? { connectorNotes: body.connectorNotes } : {})
          };
          return projectSettingsViewModel(state);
        }, statePath);

        const updatedState = await loadState(statePath);
        broadcast(globalStreams, 'snapshot', {
          kind: 'view-model',
          updatedAt: updatedState.updatedAt,
          viewModel: projectWebAppViewModel(updatedState)
        });

        json(res, 200, {
          ok: true,
          settings: result
        });
        return;
      }

      if (method === 'GET' && url.pathname === '/api/runs') {
        const state = await loadState(statePath);
        json(res, 200, projectRunListViewModel(state));
        return;
      }

      if (method === 'POST' && url.pathname === '/api/runs/start') {
        const body = await readBody(req) as { rawIntent?: string; approvalMode?: 'auto' | 'pre-execution' | 'pre-application' | 'double_approval'; };
        const rawIntent = body.rawIntent;
        if (!rawIntent || typeof rawIntent !== 'string') {
          json(res, 400, { ok: false, error: 'raw_intent_required' });
          return;
        }

        const { result } = await withStateMutation((state) => startRun(state, {
          rawIntent,
          initiatorUserId: authenticatedUser?.userId,
          tenantId: authenticatedUser?.tenantId,
          approvalMode: body.approvalMode
        }), statePath);

        const updatedState = await loadState(statePath);
        broadcast(globalStreams, 'snapshot', {
          kind: 'view-model',
          updatedAt: updatedState.updatedAt,
          viewModel: projectWebAppViewModel(updatedState)
        });
        const startRunStreams = runStreams.get(result.runId);
        if (startRunStreams) {
          broadcast(startRunStreams, 'snapshot', {
            kind: 'run',
            runId: result.runId,
            updatedAt: updatedState.updatedAt,
            run: projectRunDetailViewModel(result)
          });
        }

        json(res, 201, {
          ok: true,
          runId: result.runId,
          runState: result.run.state,
          approvalState: result.approvalCase?.state ?? null,
          releaseDecision: result.releaseDecision?.decision ?? null
        });
        return;
      }

      const approvePreExecutionMatch = method === 'POST' ? url.pathname.match(/^\/api\/runs\/([^/]+)\/approve-pre-execution$/) : null;
      if (approvePreExecutionMatch) {
        const runId = approvePreExecutionMatch[1];
        if (!runId) {
          json(res, 400, { ok: false, error: 'run_id_required' });
          return;
        }
        const { result } = await withStateMutation((state) => approvePreExecution(state, runId), statePath);
        const updatedState = await loadState(statePath);
        broadcast(globalStreams, 'snapshot', {
          kind: 'view-model',
          updatedAt: updatedState.updatedAt,
          viewModel: projectWebAppViewModel(updatedState)
        });
        const runSet = runStreams.get(result.runId);
        if (runSet) {
          broadcast(runSet, 'snapshot', {
            kind: 'run',
            runId: result.runId,
            updatedAt: updatedState.updatedAt,
            run: projectRunDetailViewModel(result)
          });
        }
        json(res, 200, {
          ok: true,
          runId: result.runId,
          runState: result.run.state,
          approvalState: result.approvalCase?.state ?? null
        });
        return;
      }

      const releaseCheckMatch = method === 'POST' ? url.pathname.match(/^\/api\/runs\/([^/]+)\/release-check$/) : null;
      if (releaseCheckMatch) {
        const runId = releaseCheckMatch[1];
        if (!runId) {
          json(res, 400, { ok: false, error: 'run_id_required' });
          return;
        }
        const body = await readBody(req) as { mixedAuthority?: boolean };
        const { result } = await withStateMutation((state) => runReleaseCheck(state, {
          runId,
          mixedAuthority: body.mixedAuthority
        }), statePath);
        const updatedState = await loadState(statePath);
        broadcast(globalStreams, 'snapshot', {
          kind: 'view-model',
          updatedAt: updatedState.updatedAt,
          viewModel: projectWebAppViewModel(updatedState)
        });
        const runSet = runStreams.get(result.runId);
        if (runSet) {
          broadcast(runSet, 'snapshot', {
            kind: 'run',
            runId: result.runId,
            updatedAt: updatedState.updatedAt,
            run: projectRunDetailViewModel(result)
          });
        }

        json(res, 200, {
          ok: true,
          runId: result.runId,
          runState: result.run.state,
          releaseDecision: result.releaseDecision?.decision ?? null,
          reasons: result.releaseDecision?.reasons ?? []
        });
        return;
      }

      const approveReleaseMatch = method === 'POST' ? url.pathname.match(/^\/api\/runs\/([^/]+)\/approve-release$/) : null;
      if (approveReleaseMatch) {
        const runId = approveReleaseMatch[1];
        if (!runId) {
          json(res, 400, { ok: false, error: 'run_id_required' });
          return;
        }
        const { result } = await withStateMutation((state) => approveRelease(state, runId), statePath);
        const updatedState = await loadState(statePath);
        broadcast(globalStreams, 'snapshot', {
          kind: 'view-model',
          updatedAt: updatedState.updatedAt,
          viewModel: projectWebAppViewModel(updatedState)
        });
        const runSet = runStreams.get(result.runId);
        if (runSet) {
          broadcast(runSet, 'snapshot', {
            kind: 'run',
            runId: result.runId,
            updatedAt: updatedState.updatedAt,
            run: projectRunDetailViewModel(result)
          });
        }
        json(res, 200, {
          ok: true,
          runId: result.runId,
          runState: result.run.state,
          releaseDecision: result.releaseDecision?.decision ?? null
        });
        return;
      }

      const runDetailsMatch = method === 'GET' ? url.pathname.match(/^\/api\/runs\/([^/]+)$/) : null;
      if (runDetailsMatch) {
        const runId = runDetailsMatch[1];
        if (!runId) {
          json(res, 400, { ok: false, error: 'run_id_required' });
          return;
        }
        const state = await loadState(statePath);
        const record = state.runRecords.find((item) => item.runId === runId);
        if (!record) {
          json(res, 404, { ok: false, error: 'run_not_found', runId });
          return;
        }
        const viewModel = projectRunDetailViewModel(record);
        json(res, 200, {
          ok: true,
          ...viewModel,
          record: legacyRunRecordPayload(record)
        });
        return;
      }

      const chatDetailsMatch = method === 'GET' ? url.pathname.match(/^\/api\/chat\/([^/]+)$/) : null;
      if (chatDetailsMatch) {
        const chatId = chatDetailsMatch[1];
        if (!chatId) {
          json(res, 400, { ok: false, error: 'chat_id_required' });
          return;
        }
        const state = await loadState(statePath);
        const record = state.chatRecords.find((item) => item.chatId === chatId);
        if (!record) {
          json(res, 404, { ok: false, error: 'chat_not_found', chatId });
          return;
        }
        json(res, 200, toChatPayload(record));
        return;
      }

      const runStreamMatch = method === 'GET' ? url.pathname.match(/^\/api\/runs\/([^/]+)\/stream$/) : null;
      if (runStreamMatch) {
        const runId = runStreamMatch[1];
        if (!runId) {
          json(res, 400, { ok: false, error: 'run_id_required' });
          return;
        }
        const state = await loadState(statePath);
        const record = state.runRecords.find((item) => item.runId === runId);
        if (!record) {
          json(res, 404, { ok: false, error: 'run_not_found', runId });
          return;
        }
        const set = runStreams.get(runId) ?? new Set<ServerResponse>();
        runStreams.set(runId, set);
        attachStream(set, res, 'heartbeat', { kind: 'run', runId });
        writeSseEvent(res, 'snapshot', {
          kind: 'run',
          runId,
          updatedAt: state.updatedAt,
          run: projectRunDetailViewModel(record)
        });
        return;
      }

      const chatStreamMatch = method === 'GET' ? url.pathname.match(/^\/api\/chat\/([^/]+)\/stream$/) : null;
      if (chatStreamMatch) {
        const chatId = chatStreamMatch[1];
        if (!chatId) {
          json(res, 400, { ok: false, error: 'chat_id_required' });
          return;
        }
        const state = await loadState(statePath);
        const record = state.chatRecords.find((item) => item.chatId === chatId);
        if (!record) {
          json(res, 404, { ok: false, error: 'chat_not_found', chatId });
          return;
        }
        const set = chatStreams.get(chatId) ?? new Set<ServerResponse>();
        chatStreams.set(chatId, set);
        attachStream(set, res, 'heartbeat', { kind: 'chat', chatId });
        writeSseEvent(res, 'chat.started', {
          ...toChatPayload(record),
          responseId: record.providerState?.lastResponseId
        });
        if (record.latestProposals.length) {
          writeSseEvent(res, 'chat.tool_proposals', {
            chatId,
            proposals: record.latestProposals,
            allProposals: record.latestProposals
          });
        }
        if (record.status === 'completed') {
          writeSseEvent(res, 'chat.completed', {
            ...toChatPayload(record),
            responseId: record.providerState?.lastResponseId
          });
        }
        if (record.status === 'failed') {
          writeSseEvent(res, 'chat.error', {
            ...toChatPayload(record),
            error: record.lastError
          });
        }
        if (record.status === 'cancelled') {
          writeSseEvent(res, 'chat.cancelled', {
            ...toChatPayload(record),
            responseId: record.providerState?.lastResponseId
          });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/events/stream') {
        const state = await loadState(statePath);
        attachStream(globalStreams, res, 'heartbeat', { kind: 'view-model' });
        writeSseEvent(res, 'snapshot', {
          kind: 'view-model',
          updatedAt: state.updatedAt,
          viewModel: projectWebAppViewModel(state)
        });
        return;
      }

      if (method === 'GET' && url.pathname === '/') {
        html(res, 200, interactiveHtml());
        return;
      }

      json(res, 404, { ok: false, error: 'not_found', path: url.pathname, method });
    } catch (error) {
      json(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown_error'
      });
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, host, () => resolve());
  });

  const address = server.address();
  const resolvedPort = typeof address === 'object' && address ? address.port : port;
  const baseUrl = `http://${host}:${resolvedPort}`;

  return {
    baseUrl,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  const statePath = process.env.OPITA_STATE_PATH || DEFAULT_STATE_PATH;
  const started = await startApiServer({ port, host: '127.0.0.1', statePath });
  console.log(JSON.stringify({ ok: true, baseUrl: started.baseUrl, statePath }, null, 2));
}
