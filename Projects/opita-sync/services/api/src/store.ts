import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { ApiState } from './state-types.js';
import { seedCatalog, seedPolicySet } from './seed.js';

export const DEFAULT_STATE_PATH = join(process.cwd(), 'data', 'state.json');

function createDefaultState(): ApiState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    policySet: seedPolicySet,
    catalog: seedCatalog,
    runRecords: []
  };
}

export async function loadState(statePath = DEFAULT_STATE_PATH): Promise<ApiState> {
  try {
    const raw = await readFile(statePath, 'utf8');
    return JSON.parse(raw) as ApiState;
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
  const temp = `${statePath}.tmp`;
  await writeFile(temp, JSON.stringify(next, null, 2), 'utf8');
  await rename(temp, statePath);
}

export async function withStateMutation<T>(
  mutator: (state: ApiState) => T | Promise<T>,
  statePath = DEFAULT_STATE_PATH
): Promise<{ state: ApiState; result: T }> {
  const state = await loadState(statePath);
  const result = await mutator(state);
  await saveState(state, statePath);
  return { state, result };
}
