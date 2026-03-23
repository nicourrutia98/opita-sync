import fs from "node:fs";
import path from "node:path";
import { toAbsolute } from "../repo-utils.mjs";

export const defaultPolicyPath = "scripts/model-router/routing-policy.v1.json";

/**
 * @typedef {{
 *   policy_version: string;
 *   baseline_tier: string;
 *   fallback_chain: string[];
 *   thresholds: { balanced_min_score: number; robust_min_score: number };
 *   signals: {
 *     weights: Record<string, number>;
 *     task_complexity_overrides: Record<string, number>;
 *     quality_profile_risk: Record<string, number>;
 *     risk_level_override: Record<string, number>;
 *   };
 *   guards: { min_output_chars: number; strict_min_output_chars: number };
 *   targets: { cost_reduction_target_pct: number; max_quality_drop_pct_points: number };
 *   tiers: Record<string, { model: string; reasoning_effort: string; service_tier: string; max_output_tokens: number }>;
 *   pricing: Record<string, { input_per_1k: number; cached_input_per_1k: number; output_per_1k: number }>;
 * }} RoutingPolicy
 */

/**
 * @param {string} [policyPath]
 * @returns {RoutingPolicy}
 */
export function loadRoutingPolicy(policyPath = defaultPolicyPath) {
  const absolute = toAbsolute(policyPath);
  const parsed = JSON.parse(fs.readFileSync(absolute, "utf8"));
  validatePolicy(parsed, absolute);
  return parsed;
}

/**
 * @param {RoutingPolicy} policy
 * @param {string} [policyPath]
 */
export function saveRoutingPolicy(policy, policyPath = defaultPolicyPath) {
  const absolute = toAbsolute(policyPath);
  fs.writeFileSync(absolute, `${JSON.stringify(policy, null, 2)}\n`);
}

/**
 * @param {unknown} candidate
 * @param {string} source
 */
function validatePolicy(candidate, source) {
  if (typeof candidate !== "object" || candidate === null) {
    throw new Error(`Invalid routing policy at ${source}: expected object`);
  }

  const policy = /** @type {Record<string, unknown>} */ (candidate);
  for (const key of ["policy_version", "baseline_tier", "fallback_chain", "thresholds", "tiers", "pricing"]) {
    if (!(key in policy)) {
      throw new Error(`Invalid routing policy at ${source}: missing key "${key}"`);
    }
  }

  if (!Array.isArray(policy.fallback_chain)) {
    throw new Error(`Invalid routing policy at ${source}: fallback_chain must be an array`);
  }
}

/**
 * @param {string} [datasetPath]
 */
export function loadBenchmarkSet(datasetPath = "scripts/model-router/benchmark-set.v1.json") {
  const absolute = toAbsolute(datasetPath);
  const parsed = JSON.parse(fs.readFileSync(absolute, "utf8"));
  if (!parsed || !Array.isArray(parsed.cases)) {
    throw new Error(`Invalid benchmark dataset at ${absolute}`);
  }
  return /** @type {{ dataset_version: string; cases: Record<string, unknown>[] }} */ (parsed);
}

/**
 * @param {string} requestId
 * @param {string} filename
 */
export function requestArtifactPath(requestId, filename) {
  return path.join("docs", "requests", requestId, filename).replaceAll("\\", "/");
}
