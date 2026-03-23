import { route } from "./router.mjs";

/**
 * @typedef {{
 *   model: string;
 *   input: string;
 *   reasoning_effort: string;
 *   service_tier: string;
 *   max_output_tokens: number;
 *   timeout_ms?: number;
 * }} AdapterRequest
 */

/**
 * @typedef {{
 *   id?: string;
 *   model: string;
 *   output_text: string;
 *   usage?: {
 *     input_tokens?: number;
 *     output_tokens?: number;
 *     input_tokens_details?: { cached_tokens?: number };
 *     output_tokens_details?: { reasoning_tokens?: number };
 *     total_tokens?: number;
 *   };
 *   raw?: unknown;
 * }} AdapterResponse
 */

/**
 * @typedef {{ invoke: (request: AdapterRequest) => Promise<AdapterResponse> }} ModelAdapter
 */

/**
 * @param {import("./router.mjs").RequestContext} requestContext
 * @param {import("./policy.mjs").RoutingPolicy} policy
 * @param {ModelAdapter} adapter
 */
export async function execute(requestContext, policy, adapter) {
  const initialRoute = route(requestContext, policy);
  const candidates = buildCandidateConfigs(initialRoute.selected_tier, policy);

  /** @type {Array<{attempt: number; tier: string; model: string; reason: string; latency_ms: number; success: boolean; failure_reason?: string; usage?: AdapterResponse["usage"]; estimated_cost_usd?: number}>} */
  const attempts = [];

  let finalAnswer = "";
  let finalUsage = undefined;
  let finalModel = initialRoute.selected_model;
  let finalServiceTier = initialRoute.service_tier;
  let finalReasoningEffort = initialRoute.reasoning_effort;
  let finalFailure = undefined;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const startedAt = Date.now();
    try {
      const response = await adapter.invoke({
        model: candidate.model,
        input: requestContext.input,
        reasoning_effort: candidate.reasoning_effort,
        service_tier: candidate.service_tier,
        max_output_tokens: candidate.max_output_tokens,
        timeout_ms: requestContext.max_latency_ms
      });
      const latencyMs = Date.now() - startedAt;
      const quality = evaluateQuality(response.output_text, requestContext, policy, latencyMs);
      const estimatedCost = estimateCostUsd(response.usage, policy.pricing[candidate.model]);

      attempts.push({
        attempt: index + 1,
        tier: candidate.tier,
        model: candidate.model,
        reason: candidate.reason,
        latency_ms: latencyMs,
        success: quality.ok,
        failure_reason: quality.ok ? undefined : quality.failure_reason,
        usage: response.usage,
        estimated_cost_usd: estimatedCost
      });

      if (quality.ok) {
        finalAnswer = response.output_text;
        finalUsage = response.usage;
        finalModel = candidate.model;
        finalServiceTier = candidate.service_tier;
        finalReasoningEffort = candidate.reasoning_effort;
        finalFailure = undefined;
        break;
      }

      finalFailure = quality.failure_reason;
      finalAnswer = response.output_text;
      finalUsage = response.usage;
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const reason = isAbortError(error) ? "timeout" : "api_error";
      attempts.push({
        attempt: index + 1,
        tier: candidate.tier,
        model: candidate.model,
        reason: candidate.reason,
        latency_ms: latencyMs,
        success: false,
        failure_reason: reason
      });
      finalFailure = reason;
    }
  }

  const totalCost = attempts.reduce((sum, attempt) => sum + (attempt.estimated_cost_usd || 0), 0);
  const success = attempts.some((attempt) => attempt.success);

  return {
    ok: success,
    answer: finalAnswer,
    failure_reason: success ? undefined : finalFailure || "fallback_exhausted",
    orchestration: {
      policy_version: policy.policy_version,
      selected_model: finalModel,
      reasoning_effort: finalReasoningEffort,
      service_tier: finalServiceTier,
      rationale_codes: initialRoute.rationale_codes,
      score: initialRoute.score,
      fallback_count: Math.max(0, attempts.length - 1),
      attempts,
      telemetry: mapTelemetry(finalUsage, totalCost, attempts),
      total_estimated_cost_usd: totalCost
    }
  };
}

/**
 * @param {string} initialTier
 * @param {import("./policy.mjs").RoutingPolicy} policy
 */
function buildCandidateConfigs(initialTier, policy) {
  /** @type {Array<{tier: string; model: string; reasoning_effort: string; service_tier: string; max_output_tokens: number; reason: string}>} */
  const candidates = [];
  const seen = new Set();

  const initial = policy.tiers[initialTier];
  candidates.push({
    tier: initialTier,
    model: initial.model,
    reasoning_effort: initial.reasoning_effort,
    service_tier: initial.service_tier,
    max_output_tokens: initial.max_output_tokens,
    reason: "initial_route"
  });
  seen.add(`${initialTier}:${initial.reasoning_effort}:${initial.model}:${initial.service_tier}`);

  for (const step of policy.fallback_chain) {
    if (step === "same_model_harder") {
      const escalated = escalateEffort(initial.reasoning_effort);
      const key = `${initialTier}:${escalated}:${initial.model}:${initial.service_tier}`;
      if (!seen.has(key)) {
        candidates.push({
          tier: initialTier,
          model: initial.model,
          reasoning_effort: escalated,
          service_tier: initial.service_tier,
          max_output_tokens: Math.round(initial.max_output_tokens * 1.2),
          reason: "same_model_harder"
        });
        seen.add(key);
      }
      continue;
    }
    const tier = policy.tiers[step];
    if (!tier) {
      continue;
    }
    const key = `${step}:${tier.reasoning_effort}:${tier.model}:${tier.service_tier}`;
    if (!seen.has(key)) {
      candidates.push({
        tier: step,
        model: tier.model,
        reasoning_effort: tier.reasoning_effort,
        service_tier: tier.service_tier,
        max_output_tokens: tier.max_output_tokens,
        reason: `fallback_${step}`
      });
      seen.add(key);
    }
  }

  return candidates;
}

/**
 * @param {string} effort
 */
function escalateEffort(effort) {
  if (effort === "minimal") return "low";
  if (effort === "low") return "medium";
  if (effort === "medium") return "high";
  return effort;
}

/**
 * @param {string} outputText
 * @param {import("./router.mjs").RequestContext} requestContext
 * @param {import("./policy.mjs").RoutingPolicy} policy
 * @param {number} latencyMs
 */
function evaluateQuality(outputText, requestContext, policy, latencyMs) {
  if (requestContext.max_latency_ms && latencyMs > requestContext.max_latency_ms) {
    return { ok: false, failure_reason: "timeout" };
  }

  if (!outputText || outputText.trim().length === 0) {
    return { ok: false, failure_reason: "schema_fail" };
  }

  const strict = (requestContext.quality_profile || "standard") === "strict";
  const minChars = requestContext.expected_min_chars ||
    (strict ? policy.guards.strict_min_output_chars : policy.guards.min_output_chars);

  if (outputText.trim().length < minChars) {
    return { ok: false, failure_reason: "quality_guard_fail" };
  }

  return { ok: true };
}

/**
 * @param {AdapterResponse["usage"] | undefined} usage
 * @param {{ input_per_1k: number; cached_input_per_1k: number; output_per_1k: number } | undefined} pricing
 */
export function estimateCostUsd(usage, pricing) {
  if (!usage || !pricing) {
    return 0;
  }
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cachedTokens = usage.input_tokens_details?.cached_tokens || 0;
  const uncachedInput = Math.max(0, inputTokens - cachedTokens);
  const inputCost = (uncachedInput / 1000) * pricing.input_per_1k;
  const cachedCost = (cachedTokens / 1000) * pricing.cached_input_per_1k;
  const outputCost = (outputTokens / 1000) * pricing.output_per_1k;
  return roundCurrency(inputCost + cachedCost + outputCost);
}

/**
 * @param {AdapterResponse["usage"] | undefined} usage
 * @param {number} totalCost
 * @param {Array<{latency_ms: number}>} attempts
 */
function mapTelemetry(usage, totalCost, attempts) {
  return {
    input_tokens: usage?.input_tokens || 0,
    output_tokens: usage?.output_tokens || 0,
    cached_tokens: usage?.input_tokens_details?.cached_tokens || 0,
    reasoning_tokens: usage?.output_tokens_details?.reasoning_tokens || 0,
    total_tokens: usage?.total_tokens || ((usage?.input_tokens || 0) + (usage?.output_tokens || 0)),
    latency_ms: attempts.reduce((sum, attempt) => sum + attempt.latency_ms, 0),
    estimated_cost_usd: roundCurrency(totalCost)
  };
}

/**
 * @param {unknown} error
 */
function isAbortError(error) {
  return typeof error === "object" &&
    error !== null &&
    "name" in error &&
    /** @type {{ name?: unknown }} */ (error).name === "AbortError";
}

/**
 * @param {number} value
 */
function roundCurrency(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
