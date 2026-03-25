import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ensureSeededState, renderWebSmokeSnapshot, runApiSmokeSuite, summarizeState } from './smoke-support.js';
import { loadState } from '../services/api/src/store.js';

const cacheRoot = join(process.cwd(), 'cache', 'smoke');
const statePath = join(process.cwd(), 'data', 'state.json');

async function main() {
  await mkdir(cacheRoot, { recursive: true });

  const db = await ensureSeededState(statePath);
  const web = await renderWebSmokeSnapshot(join(cacheRoot, 'web-smoke-output.html'));
  const api = await runApiSmokeSuite();
  const state = await loadState(statePath);
  const snapshot = summarizeState(state, statePath);

  const report = {
    ok: db.ok && web.ok && api.ok,
    db,
    web,
    api,
    snapshot
  };

  await writeFile(join(cacheRoot, 'smoke-report.json'), JSON.stringify(report, null, 2), 'utf8');
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
