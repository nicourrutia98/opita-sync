import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { ApiState } from './state-types.js';
import {
  DEFAULT_TEST_TENANT_ID,
  DEFAULT_TEST_TENANT_NAME,
  createSeededLocalUser
} from './auth-local.js';
import { seedCatalog, seedPolicySet } from './seed.js';

export const DEFAULT_STATE_PATH = join(process.cwd(), 'data', 'state.json');
const mutationQueues = new Map<string, Promise<void>>();

function createDefaultState(): ApiState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    policySet: seedPolicySet,
    catalog: seedCatalog,
    runRecords: [],
    chatRecords: [],
    localUsers: [createSeededLocalUser()],
    localSessions: [],
    settings: {
      tenantId: DEFAULT_TEST_TENANT_ID,
      tenantName: DEFAULT_TEST_TENANT_NAME,
      defaultEnvironment: 'dev',
      preferredProvider: 'OpenAI',
      connectorNotes: 'High-trust connectors remain centrally governed.'
    }
  };
}

function normalizeState(state: ApiState): ApiState {
  const base = createDefaultState();
  const tenantId = state.settings?.tenantId ?? base.settings.tenantId;
  const localUsers = state.localUsers?.length ? state.localUsers : [createSeededLocalUser(tenantId)];
  const chatRecords = (state.chatRecords ?? []).map((record) => {
    const legacy = record as typeof record & { latestResponseId?: string; sequenceNumber?: number };
    return {
      ...record,
      sequenceNumber: legacy.sequenceNumber ?? 0,
      providerState: record.providerState ?? {
        lastResponseId: legacy.latestResponseId,
        storeEnabled: false,
        continuityMode: 'manual'
      }
    };
  });

  return {
    ...base,
    ...state,
    chatRecords,
    localUsers,
    localSessions: (state.localSessions ?? []).filter((session) => Boolean(session.sessionId)),
    settings: {
      ...base.settings,
      ...(state.settings ?? {})
    }
  };
}

export async function loadState(statePath = DEFAULT_STATE_PATH): Promise<ApiState> {
  try {
    const raw = await readFile(statePath, 'utf8');
    return normalizeState(JSON.parse(raw) as ApiState);
  } catch {
    const initial = createDefaultState();
    await saveState(initial, statePath);
    return initial;
  }
}

export async function saveState(state: ApiState, statePath = DEFAULT_STATE_PATH): Promise<void> {
  const next: ApiState = {
    ...state,
    updatedAt: new Date().toISOString()
  };
  await mkdir(dirname(statePath), { recursive: true });
  const temp = `${statePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(temp, JSON.stringify(next, null, 2), 'utf8');
  await rename(temp, statePath);
}

export async function withStateMutation<T>(
  mutator: (state: ApiState) => T | Promise<T>,
  statePath = DEFAULT_STATE_PATH
): Promise<{ state: ApiState; result: T }> {
  const queueKey = statePath;
  const currentQueue = mutationQueues.get(queueKey) ?? Promise.resolve();

  const run = currentQueue.then(async () => {
    const state = await loadState(statePath);
    const result = await mutator(state);
    await saveState(state, statePath);
    return { state, result };
  });

  mutationQueues.set(
    queueKey,
    run.then(
      () => undefined,
      () => undefined
    )
  );

  return run;
}
