import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? "4000");
const host = process.env.HOST ?? "0.0.0.0";

const app = await buildApp();

try {
  await app.listen({ port, host });
  // eslint-disable-next-line no-console
  console.log(`Opita backend listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
