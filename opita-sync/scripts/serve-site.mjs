import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot } from "./lib/repo-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 4173;

/**
 * @param {string} filePath
 */
function contentType(filePath) {
  if (filePath.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }
  if (filePath.endsWith(".js")) {
    return "text/javascript; charset=utf-8";
  }
  if (filePath.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (filePath.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }
  if (filePath.endsWith(".png")) {
    return "image/png";
  }
  if (filePath.endsWith(".ico")) {
    return "image/x-icon";
  }
  if (filePath.endsWith(".md")) {
    return "text/markdown; charset=utf-8";
  }
  return "text/html; charset=utf-8";
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  const requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  let resolvedPath = path.join(repoRoot, "site", normalized);

  if (requestPath.startsWith("/../docs/")) {
    resolvedPath = path.join(repoRoot, requestPath.slice(1));
  }

  if (!resolvedPath.startsWith(repoRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (!fs.existsSync(resolvedPath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": contentType(resolvedPath) });
  fs.createReadStream(resolvedPath).pipe(response);
});

server.on("error", (error) => {
  if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE") {
    console.log(`Port ${port} already in use, reusing existing server.`);
    process.exit(0);
  }

  throw error;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Opita Sync site listening on http://127.0.0.1:${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
