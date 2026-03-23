import { estimateTokenCount } from "./router.mjs";

/**
 * @typedef {import("./executor.mjs").AdapterRequest} AdapterRequest
 * @typedef {import("./executor.mjs").AdapterResponse} AdapterResponse
 */

/**
 * Deterministic adapter used for local reproducible benchmarking and CI checks.
 */
export function createMockAdapter() {
  return {
    /**
     * @param {AdapterRequest} request
     * @returns {Promise<AdapterResponse>}
     */
    async invoke(request) {
      const seed = stableHash(`${request.model}|${request.input}|${request.reasoning_effort}|${request.service_tier}`);
      const inputTokens = estimateTokenCount(request.input);
      const modelQuality = modelQualityFactor(request.model, request.reasoning_effort, request.service_tier);
      const jitter = (seed % 19) / 100;
      const outputTokens = Math.max(18, Math.round(inputTokens * (0.85 + modelQuality * 1.35 + jitter)));
      const cachedTokens = Math.round(inputTokens * 0.2);
      const reasoningTokens = request.reasoning_effort === "medium" || request.reasoning_effort === "high"
        ? Math.round(outputTokens * 0.15)
        : 0;

      const outputText = generateText(request.input, Math.max(80, outputTokens * 8), request.model);

      // Keep async shape similar to real adapter while remaining deterministic.
      await Promise.resolve();
      return {
        id: `mock_${seed}`,
        model: request.model,
        output_text: outputText,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          input_tokens_details: { cached_tokens: cachedTokens },
          output_tokens_details: { reasoning_tokens: reasoningTokens },
          total_tokens: inputTokens + outputTokens
        }
      };
    }
  };
}

/**
 * @param {string} model
 * @param {string} reasoning
 * @param {string} serviceTier
 */
function modelQualityFactor(model, reasoning, serviceTier) {
  let score = 0.28;
  if (model.includes("mini")) score -= 0.08;
  if (model.includes("4.1")) score += 0.08;
  if (model.includes("5")) score += 0.16;
  if (reasoning === "medium") score += 0.08;
  if (reasoning === "high") score += 0.12;
  if (serviceTier === "flex") score += 0.04;
  return Math.max(0.15, Math.min(score, 0.9));
}

/**
 * @param {string} input
 * @param {number} targetChars
 * @param {string} model
 */
function generateText(input, targetChars, model) {
  const prompt = `Model ${model} response: `;
  const base = `${input} `;
  let text = prompt;
  while (text.length < targetChars) {
    text += base;
  }
  return text.slice(0, targetChars).trim();
}

/**
 * @param {string} value
 */
function stableHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
