import fs from "node:fs";
import { execute } from "./lib/model-router/executor.mjs";
import { createLiveAdapter } from "./lib/model-router/live-adapter.mjs";
import { createMockAdapter } from "./lib/model-router/mock-adapter.mjs";
import { loadBenchmarkSet, loadRoutingPolicy, requestArtifactPath } from "./lib/model-router/policy.mjs";
import { summarizeBenchmark, bootstrapCostDelta } from "./lib/model-router/reporting.mjs";
import { ensureDirectory, toAbsolute } from "./lib/repo-utils.mjs";
import { getActiveRequest } from "./lib/request-registry.mjs";

const useLive = process.argv.includes("--live");
const policy = loadRoutingPolicy();
const dataset = loadBenchmarkSet();
const activeRequest = getActiveRequest();
const adapter = useLive ? createLiveAdapter() : createMockAdapter();

/** @type {import("./lib/model-router/reporting.mjs").BenchmarkRecord[]} */
const records = [];

for (const rawCase of dataset.cases) {
  const benchmarkCase = normalizeCase(rawCase);
  const baseline = await execute({ ...benchmarkCase, force_tier: policy.baseline_tier }, policy, adapter);
  const router = await execute(benchmarkCase, policy, adapter);

  records.push(mapRecord("baseline", benchmarkCase.id, baseline));
  records.push(mapRecord("router", benchmarkCase.id, router));
}

const summary = summarizeBenchmark(records);
const confidence = bootstrapCostDelta(
  records.filter((record) => record.mode === "baseline"),
  records.filter((record) => record.mode === "router")
);

const output = {
  generated_at: new Date().toISOString(),
  dataset_version: dataset.dataset_version,
  policy_version: policy.policy_version,
  execution_mode: useLive ? "live" : "mock",
  records,
  summary,
  confidence_interval_pct: confidence
};

const artifact = requestArtifactPath(activeRequest.id, "router-benchmark-results.json");
ensureDirectory(`docs/requests/${activeRequest.id}`);
fs.writeFileSync(toAbsolute(artifact), `${JSON.stringify(output, null, 2)}\n`);

console.log(`Benchmark completed (${output.execution_mode}). Wrote ${artifact}`);

/**
 * @typedef {{
 *   id: string;
 *   task_type: string;
 *   input: string;
 *   quality_profile: "relaxed" | "standard" | "strict";
 *   max_latency_ms?: number;
 *   cost_mode: "aggressive" | "balanced";
 *   risk_level: "low" | "medium" | "high";
 *   requires_tools: boolean;
 *   expected_min_chars?: number;
 * }} BenchmarkCase
 */

/**
 * @param {Record<string, unknown>} rawCase
 * @returns {BenchmarkCase}
 */
function normalizeCase(rawCase) {
  return {
    id: String(rawCase.id),
    task_type: String(rawCase.task_type),
    input: String(rawCase.input),
    quality_profile: toQuality(rawCase.quality_profile),
    max_latency_ms: toNumber(rawCase.max_latency_ms),
    cost_mode: toCostMode(rawCase.cost_mode),
    risk_level: toRisk(rawCase.risk_level),
    requires_tools: Boolean(rawCase.requires_tools),
    expected_min_chars: toNumber(rawCase.expected_min_chars)
  };
}

/**
 * @param {"baseline" | "router"} mode
 * @param {string} caseId
 * @param {Awaited<ReturnType<typeof execute>>} result
 */
function mapRecord(mode, caseId, result) {
  return {
    mode,
    case_id: caseId,
    success: result.ok,
    estimated_cost_usd: result.orchestration.telemetry.estimated_cost_usd,
    latency_ms: result.orchestration.telemetry.latency_ms,
    total_tokens: result.orchestration.telemetry.total_tokens,
    fallback_count: result.orchestration.fallback_count
  };
}

/**
 * @param {unknown} value
 */
function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

/**
 * @param {unknown} value
 * @returns {"relaxed" | "standard" | "strict"}
 */
function toQuality(value) {
  return value === "relaxed" || value === "standard" || value === "strict" ? value : "standard";
}

/**
 * @param {unknown} value
 * @returns {"low" | "medium" | "high"}
 */
function toRisk(value) {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

/**
 * @param {unknown} value
 * @returns {"aggressive" | "balanced"}
 */
function toCostMode(value) {
  return value === "aggressive" || value === "balanced" ? value : "balanced";
}
