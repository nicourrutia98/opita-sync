export type ProviderId = 'openai' | 'anthropic' | 'gemini';

export interface IntentInterpreterRequest { rawIntent: string; }
export interface IntentInterpreterResult { providerId: ProviderId; normalizedIntent: string; confidence: number; }
export interface ProviderAdapter { providerId: ProviderId; interpretIntent(request: IntentInterpreterRequest): IntentInterpreterResult; }
