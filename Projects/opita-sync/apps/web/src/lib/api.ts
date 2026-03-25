import { z } from 'zod';
import type {
  ActivityItemSummary,
  CatalogItemSummary,
  CommandRunResponse,
  GovernanceSummary,
  InboxItemSummary,
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

export function fetchViewModel() {
  return readJson<ViewModelResponse>('/api/view-model');
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

