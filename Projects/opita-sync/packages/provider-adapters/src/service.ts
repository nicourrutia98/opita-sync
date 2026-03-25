import type { IntentInterpreterRequest, IntentInterpreterResult, ProviderAdapter } from './models.js';

function makeAdapter(providerId: ProviderAdapter['providerId']): ProviderAdapter {
  return {
    providerId,
    interpretIntent(request: IntentInterpreterRequest): IntentInterpreterResult {
      return { providerId, normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
    }
  };
}

export const openaiAdapter = makeAdapter('openai');
export const anthropicAdapter = makeAdapter('anthropic');
export const geminiAdapter = makeAdapter('gemini');
