import http from "node:http";
import { execute } from "./lib/model-router/executor.mjs";
import { createLiveAdapter } from "./lib/model-router/live-adapter.mjs";
import { createMockAdapter } from "./lib/model-router/mock-adapter.mjs";
import { loadRoutingPolicy } from "./lib/model-router/policy.mjs";

const port = Number(process.env.ORCHESTRATOR_PORT || 8787);
const allowMock = process.env.ORCHESTRATOR_ALLOW_MOCK === "true";
const policy = loadRoutingPolicy();

const adapter = (() => {
  try {
    return createLiveAdapter();
  } catch (error) {
    if (allowMock) {
      return createMockAdapter();
    }
    throw error;
  }
})();

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      json(response, 200, { ok: true, policy_version: policy.policy_version });
      return;
    }

    if (request.method !== "POST" || request.url !== "/ai/orchestrate") {
      json(response, 404, { error: "Not found" });
      return;
    }

    const body = await readJson(request);
    const input = typeof body.input === "string" ? body.input : "";
    if (!input) {
      json(response, 400, { error: "input is required and must be a string" });
      return;
    }

    const result = await execute({
      task_type: asString(body.task_type),
      input,
      quality_profile: asQualityProfile(body.quality_profile),
      max_latency_ms: asNumber(body.max_latency_ms),
      cost_mode: asCostMode(body.cost_mode),
      risk_level: asRiskLevel(body.risk_level),
      requires_tools: asBoolean(body.requires_tools),
      expected_min_chars: asNumber(body.expected_min_chars)
    }, policy, adapter);

    json(response, result.ok ? 200 : 502, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    json(response, 500, { error: message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Orchestrator listening on http://127.0.0.1:${port}`);
});

/**
 * @param {http.IncomingMessage} request
 */
function readJson(request) {
  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const chunks = [];
    request.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    request.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

/**
 * @param {http.ServerResponse} response
 * @param {number} statusCode
 * @param {unknown} payload
 */
function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

/**
 * @param {unknown} value
 */
function asString(value) {
  return typeof value === "string" ? value : undefined;
}

/**
 * @param {unknown} value
 */
function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * @param {unknown} value
 */
function asBoolean(value) {
  return typeof value === "boolean" ? value : false;
}

/**
 * @param {unknown} value
 */
function asQualityProfile(value) {
  return value === "relaxed" || value === "standard" || value === "strict" ? value : "standard";
}

/**
 * @param {unknown} value
 */
function asCostMode(value) {
  return value === "aggressive" || value === "balanced" ? value : "balanced";
}

/**
 * @param {unknown} value
 */
function asRiskLevel(value) {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}
