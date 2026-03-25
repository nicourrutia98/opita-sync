import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { loadState, withStateMutation, DEFAULT_STATE_PATH } from './store.js';
import { approvePreExecution, approveRelease, runReleaseCheck, startRun } from './runtime-api.js';
import {
  projectActivityViewModel,
  projectCatalogViewModel,
  projectGovernanceViewModel,
  projectInboxViewModel,
  projectRunDetailViewModel,
  projectRunListViewModel,
  projectSettingsViewModel,
  projectWebAppViewModel
} from './projectors.js';

interface StartOptions {
  port?: number;
  host?: string;
  statePath?: string;
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

export async function startApiServer(options: StartOptions = {}) {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? 0;
  const statePath = options.statePath ?? DEFAULT_STATE_PATH;
  const globalStreams = new Set<ServerResponse>();
  const runStreams = new Map<string, Set<ServerResponse>>();

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

  const server = createServer(async (req, res) => {
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', `http://${host}:${port}`);

    try {
      if (method === 'GET' && url.pathname === '/health') {
        json(res, 200, { ok: true, statePath });
        return;
      }

      if (method === 'GET' && url.pathname === '/api/view-model') {
        const state = await loadState(statePath);
        json(res, 200, projectWebAppViewModel(state));
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
        json(res, 200, projectRunDetailViewModel(record));
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
