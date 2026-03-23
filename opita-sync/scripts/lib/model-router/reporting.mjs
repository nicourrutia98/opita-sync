/**
 * @typedef {{
 *   mode: "baseline" | "router";
 *   case_id: string;
 *   success: boolean;
 *   estimated_cost_usd: number;
 *   latency_ms: number;
 *   total_tokens: number;
 *   fallback_count: number;
 * }} BenchmarkRecord
 */

/**
 * @param {BenchmarkRecord[]} records
 */
export function summarizeBenchmark(records) {
  const baseline = summarizeMode(records.filter((record) => record.mode === "baseline"));
  const router = summarizeMode(records.filter((record) => record.mode === "router"));
  const deltas = {
    cost_per_successful_request_pct: pctChange(router.cost_per_successful_request_usd, baseline.cost_per_successful_request_usd),
    pass_rate_pct_points: roundPct(router.pass_rate_pct - baseline.pass_rate_pct),
    p95_latency_ms_pct: pctChange(router.p95_latency_ms, baseline.p95_latency_ms),
    fallback_rate_pct_points: roundPct(router.fallback_rate_pct - baseline.fallback_rate_pct)
  };

  return { baseline, router, deltas };
}

/**
 * @param {BenchmarkRecord[]} records
 */
function summarizeMode(records) {
  const count = records.length;
  const successCount = records.filter((record) => record.success).length;
  const totalCost = sum(records.map((record) => record.estimated_cost_usd));
  const successfulCost = sum(records.filter((record) => record.success).map((record) => record.estimated_cost_usd));
  const totalLatency = sum(records.map((record) => record.latency_ms));
  const totalTokens = sum(records.map((record) => record.total_tokens));
  const fallbackRate = count === 0 ? 0 : records.filter((record) => record.fallback_count > 0).length / count;

  return {
    request_count: count,
    success_count: successCount,
    pass_rate_pct: count === 0 ? 0 : roundPct((successCount / count) * 100),
    total_cost_usd: roundUsd(totalCost),
    cost_per_successful_request_usd: successCount === 0 ? 0 : roundUsd(successfulCost / successCount),
    p95_latency_ms: percentile(records.map((record) => record.latency_ms), 0.95),
    average_tokens_per_request: count === 0 ? 0 : Math.round(totalTokens / count),
    fallback_rate_pct: roundPct(fallbackRate * 100),
    average_latency_ms: count === 0 ? 0 : Math.round(totalLatency / count)
  };
}

/**
 * @param {number[]} values
 * @param {number} p
 */
function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
}

/**
 * @param {number} nextValue
 * @param {number} previousValue
 */
function pctChange(nextValue, previousValue) {
  if (previousValue === 0) {
    return 0;
  }
  return roundPct(((nextValue - previousValue) / previousValue) * 100);
}

/**
 * @param {number[]} values
 */
function sum(values) {
  return values.reduce((acc, value) => acc + value, 0);
}

/**
 * @param {number} value
 */
function roundUsd(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/**
 * @param {number} value
 */
function roundPct(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Deterministic bootstrap confidence interval for cost delta.
 * @param {BenchmarkRecord[]} baselineRecords
 * @param {BenchmarkRecord[]} routerRecords
 * @param {number} [iterations]
 */
export function bootstrapCostDelta(baselineRecords, routerRecords, iterations = 250) {
  const samples = Math.max(1, Math.min(baselineRecords.length, routerRecords.length));
  if (samples === 0) {
    return { low: 0, high: 0 };
  }
  const random = createDeterministicRandom(883211);
  /** @type {number[]} */
  const deltas = [];
  for (let i = 0; i < iterations; i += 1) {
    /** @type {BenchmarkRecord[]} */
    const sampleBaseline = [];
    /** @type {BenchmarkRecord[]} */
    const sampleRouter = [];
    for (let n = 0; n < samples; n += 1) {
      sampleBaseline.push(baselineRecords[Math.floor(random() * baselineRecords.length)]);
      sampleRouter.push(routerRecords[Math.floor(random() * routerRecords.length)]);
    }
    const baselineSummary = summarizeMode(sampleBaseline);
    const routerSummary = summarizeMode(sampleRouter);
    deltas.push(pctChange(routerSummary.cost_per_successful_request_usd, baselineSummary.cost_per_successful_request_usd));
  }
  deltas.sort((a, b) => a - b);
  return {
    low: deltas[Math.floor(iterations * 0.05)] ?? 0,
    high: deltas[Math.floor(iterations * 0.95)] ?? 0
  };
}

/**
 * @param {number} seed
 */
function createDeterministicRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}
