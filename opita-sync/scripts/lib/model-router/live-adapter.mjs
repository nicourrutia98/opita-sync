/**
 * @typedef {import("./executor.mjs").AdapterRequest} AdapterRequest
 * @typedef {import("./executor.mjs").AdapterResponse} AdapterResponse
 */

/**
 * @param {{ apiKey?: string; baseUrl?: string }} [options]
 */
export function createLiveAdapter(options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for live adapter");
  }

  const baseUrl = options.baseUrl || "https://api.openai.com/v1";

  return {
    /**
     * @param {AdapterRequest} request
     * @returns {Promise<AdapterResponse>}
     */
    async invoke(request) {
      const controller = new AbortController();
      const timeoutMs = request.timeout_ms || 20_000;
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const body = {
          model: request.model,
          input: request.input,
          reasoning: { effort: request.reasoning_effort },
          service_tier: request.service_tier,
          max_output_tokens: request.max_output_tokens,
          store: false
        };

        const response = await fetch(`${baseUrl}/responses`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        const payload = await response.json();
        if (!response.ok) {
          const message = typeof payload === "object" && payload && "error" in payload
            ? JSON.stringify(payload.error)
            : JSON.stringify(payload);
          throw new Error(`Responses API error (${response.status}): ${message}`);
        }

        return {
          id: payload.id,
          model: payload.model,
          output_text: extractOutputText(payload),
          usage: payload.usage,
          raw: payload
        };
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

/**
 * @param {any} payload
 */
function extractOutputText(payload) {
  if (!payload || !Array.isArray(payload.output)) {
    return "";
  }

  /** @type {string[]} */
  const parts = [];
  for (const item of payload.output) {
    if (!item || item.type !== "message" || !Array.isArray(item.content)) {
      continue;
    }
    for (const content of item.content) {
      if (content && content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}
