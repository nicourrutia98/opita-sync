import fs from "node:fs";
import { loadRoutingPolicy, saveRoutingPolicy, requestArtifactPath } from "./lib/model-router/policy.mjs";
import { summarizeBenchmark } from "./lib/model-router/reporting.mjs";
import { readText, toAbsolute } from "./lib/repo-utils.mjs";
import { getActiveRequest } from "./lib/request-registry.mjs";

const activeRequest = getActiveRequest();
const policy = loadRoutingPolicy();
const benchmarkPath = requestArtifactPath(activeRequest.id, "router-benchmark-results.json");
const benchmark = JSON.parse(readText(benchmarkPath));
const summary = summarizeBenchmark(benchmark.records);

const currentBalanced = policy.thresholds.balanced_min_score;
const currentRobust = policy.thresholds.robust_min_score;

const costReduction = -summary.deltas.cost_per_successful_request_pct;
const qualityDrop = -summary.deltas.pass_rate_pct_points;

let nextBalanced = currentBalanced;
let nextRobust = currentRobust;
/** @type {string[]} */
const adjustments = [];

if (qualityDrop > policy.targets.max_quality_drop_pct_points) {
  nextBalanced = clamp(nextBalanced - 0.03, 0.2, 0.8);
  nextRobust = clamp(nextRobust - 0.03, nextBalanced + 0.05, 0.95);
  adjustments.push("quality_drop_above_target: prefer stronger models by lowering thresholds");
} else if (costReduction < policy.targets.cost_reduction_target_pct) {
  nextBalanced = clamp(nextBalanced + 0.03, 0.2, 0.85);
  nextRobust = clamp(nextRobust + 0.03, nextBalanced + 0.05, 0.95);
  adjustments.push("cost_reduction_below_target: prefer cheaper models by increasing thresholds");
} else {
  adjustments.push("targets_met: keep thresholds unchanged");
}

policy.thresholds.balanced_min_score = round(nextBalanced);
policy.thresholds.robust_min_score = round(nextRobust);
saveRoutingPolicy(policy);

const note = `# Router Calibration Log

## Metadata

- Timestamp: ${new Date().toISOString()}
- Policy version: ${policy.policy_version}
- Source benchmark: ${benchmarkPath}

## Inputs

- Cost reduction observed (%): ${costReduction}
- Quality drop observed (pp): ${qualityDrop}
- Cost reduction target (%): ${policy.targets.cost_reduction_target_pct}
- Max quality drop target (pp): ${policy.targets.max_quality_drop_pct_points}

## Threshold Update

- balanced_min_score: ${currentBalanced} -> ${policy.thresholds.balanced_min_score}
- robust_min_score: ${currentRobust} -> ${policy.thresholds.robust_min_score}

## Rationale

${adjustments.map((value) => `- ${value}`).join("\n")}
`;

const calibrationPath = requestArtifactPath(activeRequest.id, "router-calibration-log.md");
fs.writeFileSync(toAbsolute(calibrationPath), `${note}\n`);

console.log(`Router policy calibrated and saved. Log: ${calibrationPath}`);

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * @param {number} value
 */
function round(value) {
  return Math.round(value * 1000) / 1000;
}
