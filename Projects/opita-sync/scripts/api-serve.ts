import { join } from 'node:path';

import { startApiServer } from '../services/api/src/server.js';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const statePath = process.env.OPITA_STATE_PATH || join(process.cwd(), 'data', 'state.json');
const api = await startApiServer({ port, host: '127.0.0.1', statePath });

console.log(JSON.stringify({ ok: true, baseUrl: api.baseUrl, statePath }, null, 2));

const shutdown = async () => {
  await api.close();
  process.exit(0);
};

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

await new Promise<void>(() => {
  // Keep the process alive until killed.
});
