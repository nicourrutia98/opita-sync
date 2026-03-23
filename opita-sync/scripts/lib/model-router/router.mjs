/**
 * @typedef {{
 *   task_type?: string;
 *   input: string;
 *   quality_profile?: "relaxed" | "standard" | "strict";
 *   max_latency_ms?: number;
 *   cost_mode?: "aggressive" | "balanced";
 *   risk_level?: "low" | "medium" | "high";
 *   requires_tools?: boolean;
 *   fallback_history?: string[];
 *   force_tier?: string;
 *   expected_min_chars?: number;
 * }} RequestContext
 */

/**
 * @typedef {{
 *   selected_model: string;
 *   selected_tier: string;
 *   reasoning_effort: string;
 *   service_tier: string;
 *   max_output_tokens: number;
 *   policy_version: string;
 *   rationale_codes: string[];
 *   score: number;
 * }} RouteDecision
 */

/**
 * @param {RequestContext} requestContext
 * @param {import("./policy.mjs").RoutingPolicy} policy
 * @returns {RouteDecision}
 */
export function route(requestContext, policy) {
  if (requestContext.force_tier) {
    const tier = policy.tiers[requestContext.force_tier];
    if (!tier) {
      throw new Error(`Unknown forced tier: ${requestContext.force_tier}`);
    }
    return {
      selected_model: tier.model,
      selected_tier: requestContext.force_tier,
      reasoning_effort: tier.reasoning_effort,
      service_tier: tier.service_tier,
      max_output_tokens: tier.max_output_tokens,
      policy_version: policy.policy_version,
      rationale_codes: ["forced_tier"],
      score: 1
    };
  }

  const weights = policy.signals.weights;
  const complexity = readComplexity(requestContext, policy);
  const risk = readRisk(requestContext, policy);
  const context = normalize(estimateTokenCount(requestContext.input), 40, 3000);
  const tools = requestContext.requires_tools ? 1 : 0;
  const fallbackHistory = normalize((requestContext.fallback_history || []).length, 0, 3);

  let score = complexity * weights.complexity +
    risk * weights.risk +
    context * weights.context +
    tools * weights.tools +
    fallbackHistory * weights.fallback_history;

  const quality = requestContext.quality_profile || "standard";
  if (quality === "strict") {
    score += 0.08;
  }
  if ((requestContext.cost_mode || "balanced") === "aggressive") {
    score -= 0.06;
  }
  score = clamp(score, 0, 1);

  /** @type {string[]} */
  const rationale = [];
  if (complexity > 0.65) rationale.push("high_complexity");
  if (risk > 0.7) rationale.push("high_risk");
  if (context > 0.7) rationale.push("long_context");
  if (tools > 0) rationale.push("tools_required");
  if (fallbackHistory > 0) rationale.push("fallback_history");
  if (quality === "strict") rationale.push("strict_quality_profile");
  if ((requestContext.cost_mode || "balanced") === "aggressive") rationale.push("aggressive_cost_mode");

  const tierName = score >= policy.thresholds.robust_min_score
    ? "robust"
    : score >= policy.thresholds.balanced_min_score
      ? "balanced"
      : "economy";
  const tier = policy.tiers[tierName];
  rationale.push(`selected_${tierName}`);

  return {
    selected_model: tier.model,
    selected_tier: tierName,
    reasoning_effort: tier.reasoning_effort,
    service_tier: tier.service_tier,
    max_output_tokens: tier.max_output_tokens,
    policy_version: policy.policy_version,
    rationale_codes: rationale,
    score
  };
}

/**
 * @param {RequestContext} requestContext
 * @param {import("./policy.mjs").RoutingPolicy} policy
 */
function readComplexity(requestContext, policy) {
  if (requestContext.task_type && policy.signals.task_complexity_overrides[requestContext.task_type] !== undefined) {
    return policy.signals.task_complexity_overrides[requestContext.task_type];
  }
  return normalize(estimateTokenCount(requestContext.input), 20, 1600);
}

/**
 * @param {RequestContext} requestContext
 * @param {import("./policy.mjs").RoutingPolicy} policy
 */
function readRisk(requestContext, policy) {
  if (requestContext.risk_level && policy.signals.risk_level_override[requestContext.risk_level] !== undefined) {
    return policy.signals.risk_level_override[requestContext.risk_level];
  }
  const quality = requestContext.quality_profile || "standard";
  return policy.signals.quality_profile_risk[quality] ?? 0.5;
}

/**
 * @param {string} text
 */
export function estimateTokenCount(text) {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function normalize(value, min, max) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
