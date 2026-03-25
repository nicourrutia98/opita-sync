import { z } from 'zod';
import type {
  ActivityItemSummary,
  AuthSessionResponse,
  CatalogItemSummary,
  ChatSessionResponse,
  CommandRunResponse,
  CommandSettingsResponse,
  GovernanceSummary,
  InboxItemSummary,
  OperateThreadPageResponse,
  OperateWorkspaceResponse,
  RunDetailResponse,
  RunListResponse,
  SettingsSummary,
  ViewModelResponse
} from './types.js';

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? `request_failed_${response.status}`);
  }
  return payload as T;
}

export function fetchHealth() {
  return readJson<{ ok: true; statePath: string }>('/health');
}

export function fetchAuthSession() {
  return readJson<AuthSessionResponse>('/api/auth/session');
}

export function login(payload: { email: string; password: string }) {
  return readJson<AuthSessionResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function logout() {
  return readJson<{ ok: true }>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export function fetchViewModel() {
  return readJson<ViewModelResponse>('/api/view-model');
}

export function fetchOperateWorkspace(runId?: string | null) {
  const query = runId ? `?runId=${encodeURIComponent(runId)}` : '';
  return readJson<OperateWorkspaceResponse>(`/api/operate/workspace${query}`);
}

export function fetchOperateThreadPage(payload?: { runId?: string | null; before?: string | null; limit?: number }) {
  const query = new URLSearchParams();
  if (payload?.runId) query.set('runId', payload.runId);
  if (payload?.before) query.set('before', payload.before);
  if (payload?.limit) query.set('limit', String(payload.limit));
  const suffix = query.size ? `?${query.toString()}` : '';
  return readJson<OperateThreadPageResponse>(`/api/operate/thread${suffix}`);
}

export function fetchCatalog() {
  return readJson<{ items: CatalogItemSummary[] }>('/api/catalog');
}

export function fetchInbox() {
  return readJson<{ items: InboxItemSummary[] }>('/api/inbox');
}

export function fetchActivity() {
  return readJson<RunListResponse>('/api/activity');
}

export function fetchGovernance() {
  return readJson<GovernanceSummary>('/api/governance');
}

export function fetchSettings() {
  return readJson<SettingsSummary>('/api/settings');
}

export function updateSettings(payload: {
  tenantId: string;
  tenantName: string;
  defaultEnvironment: 'dev' | 'staging' | 'prod';
  preferredProvider: string;
  connectorNotes: string;
}) {
  return readJson<CommandSettingsResponse>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function fetchRun(runId: string) {
  return readJson<RunDetailResponse>(`/api/runs/${runId}`);
}

export function startRun(payload: {
  rawIntent: string;
  approvalMode: 'auto' | 'pre-execution' | 'pre-application' | 'double_approval';
  classificationLevel: 'internal' | 'confidential' | 'restricted' | 'high_impact';
  requestedActionAssetId?: string;
  mixedAuthority?: boolean;
  externalSend?: boolean;
}) {
  return readJson<CommandRunResponse>('/api/runs/start', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function releaseCheck(runId: string, payload?: { mixedAuthority?: boolean }) {
  return readJson<CommandRunResponse>(`/api/runs/${runId}/release-check`, {
    method: 'POST',
    body: JSON.stringify(payload ?? {})
  });
}

export function approveRelease(runId: string) {
  return readJson<CommandRunResponse>(`/api/runs/${runId}/approve-release`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export function approvePreExecution(runId: string) {
  return readJson<CommandRunResponse>(`/api/runs/${runId}/approve-pre-execution`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export function startChat(payload: { message: string; chatId?: string }) {
  return readJson<ChatSessionResponse>('/api/chat/start', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchChat(chatId: string) {
  return readJson<ChatSessionResponse>(`/api/chat/${chatId}`);
}

export function stopChat(chatId: string) {
  return readJson<ChatSessionResponse>(`/api/chat/${chatId}/stop`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

const streamPayloadSchema = z.object({
  kind: z.string(),
  runId: z.string().optional(),
  updatedAt: z.string().optional()
});

export function subscribeToGlobalStream(onMessage: () => void) {
  const source = new EventSource('/api/events/stream');
  const handler = () => onMessage();
  source.addEventListener('snapshot', handler);
  source.onmessage = handler;
  source.onerror = () => undefined;
  return () => source.close();
}

export function subscribeToRunStream(runId: string, onMessage: () => void) {
  const source = new EventSource(`/api/runs/${runId}/stream`);
  const handler = () => onMessage();
  source.addEventListener('snapshot', handler);
  source.onmessage = handler;
  source.onerror = () => undefined;
  return () => source.close();
}

export function subscribeToChatStream(
  chatId: string,
  handlers: {
    onStarted?: (payload: Record<string, unknown>) => void;
    onDelta?: (payload: Record<string, unknown>) => void;
    onToolProposals?: (payload: Record<string, unknown>) => void;
    onCompleted?: (payload: Record<string, unknown>) => void;
    onCancelled?: (payload: Record<string, unknown>) => void;
    onError?: (payload: Record<string, unknown>) => void;
  }
) {
  const source = new EventSource(`/api/chat/${chatId}/stream`);

  const bind = (eventName: string, handler?: (payload: Record<string, unknown>) => void) => {
    if (!handler) return;
    source.addEventListener(eventName, (event) => {
      const parsed = JSON.parse((event as MessageEvent).data) as Record<string, unknown>;
      handler(parsed);
    });
  };

  bind('chat.started', handlers.onStarted);
  bind('chat.delta', handlers.onDelta);
  bind('chat.tool_proposals', handlers.onToolProposals);
  bind('chat.completed', handlers.onCompleted);
  bind('chat.cancelled', handlers.onCancelled);
  bind('chat.error', handlers.onError);
  source.onerror = () => undefined;
  return () => source.close();
}

