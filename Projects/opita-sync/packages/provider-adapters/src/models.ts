export type ProviderId = 'openai' | 'anthropic' | 'gemini';

export interface IntentInterpreterRequest { rawIntent: string; }
export interface IntentInterpreterResult { providerId: ProviderId; normalizedIntent: string; confidence: number; }

export interface ProviderChatAsset {
  assetId: string;
  name: string;
  description: string;
  approvalMode: string;
  connectorIds: string[];
}

export interface ProviderChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderStateHint {
  lastResponseId?: string;
  canResumeProviderState: boolean;
}

export interface ProviderChatRequest {
  history: ProviderChatHistoryEntry[];
  governedInstructions: string;
  assets: ProviderChatAsset[];
  providerStateHint?: ProviderStateHint;
  abortSignal?: AbortSignal;
}

export interface ProviderToolProposal {
  callId: string;
  name: string;
  argumentsJson: string;
  assetId?: string;
  intentSummary?: string;
  rationale?: string;
  requiresApproval?: boolean;
  riskNotes?: string[];
}

export type ProviderErrorCode =
  | 'provider_not_configured'
  | 'provider_payload_invalid'
  | 'provider_request_rejected'
  | 'provider_stream_unavailable'
  | 'provider_state_resume_miss'
  | 'provider_response_shape_invalid'
  | 'provider_rate_limited'
  | 'provider_transient_failure';

export type ProviderChatEvent =
  | { type: 'started'; responseId?: string; model?: string; requestId?: string; continuityMode?: 'manual' | 'provider' | 'fallback_manual' }
  | { type: 'delta'; delta: string }
  | { type: 'tool_proposals'; proposals: ProviderToolProposal[] }
  | {
      type: 'completed';
      responseId?: string;
      model?: string;
      requestId?: string;
      continuityMode?: 'manual' | 'provider' | 'fallback_manual';
      recoverableError?: string;
      text: string;
      proposals: ProviderToolProposal[];
    }
  | {
      type: 'error';
      code: ProviderErrorCode;
      message: string;
      requestId?: string;
      recoverable?: boolean;
      detail?: string;
    };

export interface ProviderAdapter {
  providerId: ProviderId;
  interpretIntent(request: IntentInterpreterRequest): IntentInterpreterResult;
  streamChat(request: ProviderChatRequest): AsyncIterable<ProviderChatEvent>;
}
