import fs from "node:fs";
import { loadRoutingPolicy, requestArtifactPath } from "./lib/model-router/policy.mjs";
import { summarizeBenchmark } from "./lib/model-router/reporting.mjs";
import { readText, toAbsolute } from "./lib/repo-utils.mjs";
import { getActiveRequest } from "./lib/request-registry.mjs";

const activeRequest = getActiveRequest();
const policy = loadRoutingPolicy();
const benchmarkPath = requestArtifactPath(activeRequest.id, "router-benchmark-results.json");
const benchmark = JSON.parse(readText(benchmarkPath));
const summary = summarizeBenchmark(benchmark.records);

const costReduction = -summary.deltas.cost_per_successful_request_pct;
const qualityDrop = -summary.deltas.pass_rate_pct_points;
const go = costReduction >= policy.targets.cost_reduction_target_pct &&
  qualityDrop <= policy.targets.max_quality_drop_pct_points;

const report = `# Router Benchmark Report

## Metadata

- Generated at: ${new Date().toISOString()}
- Dataset version: ${benchmark.dataset_version}
- Policy version: ${benchmark.policy_version}
- Execution mode: ${benchmark.execution_mode}

## Summary Table

| Metric | Baseline | Router |
| --- | --- | --- |
| Requests | ${summary.baseline.request_count} | ${summary.router.request_count} |
| Pass rate (%) | ${summary.baseline.pass_rate_pct} | ${summary.router.pass_rate_pct} |
| Cost per successful request (USD) | ${summary.baseline.cost_per_successful_request_usd} | ${summary.router.cost_per_successful_request_usd} |
| P95 latency (ms) | ${summary.baseline.p95_latency_ms} | ${summary.router.p95_latency_ms} |
| Fallback rate (%) | ${summary.baseline.fallback_rate_pct} | ${summary.router.fallback_rate_pct} |
| Avg tokens/request | ${summary.baseline.average_tokens_per_request} | ${summary.router.average_tokens_per_request} |

## Delta

- Cost delta (%): ${summary.deltas.cost_per_successful_request_pct}
- Pass-rate delta (pp): ${summary.deltas.pass_rate_pct_points}
- P95 latency delta (%): ${summary.deltas.p95_latency_ms_pct}
- Fallback-rate delta (pp): ${summary.deltas.fallback_rate_pct_points}
- Bootstrap CI cost delta (%): [${benchmark.confidence_interval_pct.low}, ${benchmark.confidence_interval_pct.high}]

## Decision

- Cost reduction target (%): ${policy.targets.cost_reduction_target_pct}
- Max quality drop (pp): ${policy.targets.max_quality_drop_pct_points}
- Go / No-Go: ${go ? "go" : "no-go"}
`;

const reportPath = requestArtifactPath(activeRequest.id, "router-benchmark-report.md");
fs.writeFileSync(toAbsolute(reportPath), `${report}\n`);

console.log(`Router report generated: ${reportPath}`);
