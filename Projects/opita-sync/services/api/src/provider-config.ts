export interface ProviderStatusSummary {
  providerId: 'openai';
  configured: boolean;
  source: 'env' | 'missing';
  defaultModel: string;
  capabilities: string[];
}

export function readOpenAIProviderStatus(env: NodeJS.ProcessEnv = process.env): ProviderStatusSummary {
  const configured = Boolean(env.OPENAI_API_KEY);

  return {
    providerId: 'openai',
    configured,
    source: configured ? 'env' : 'missing',
    defaultModel: env.OPENAI_MODEL ?? 'gpt-5-mini',
    capabilities: ['streaming', 'text', 'tool-proposals', 'multimodal-ready']
  };
}
