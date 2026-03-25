import { join } from 'node:path';

import { ensureSeededState } from './smoke-support.js';

const statePath = join(process.cwd(), 'data', 'state.json');

async function main() {
  const result = await ensureSeededState(statePath);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
