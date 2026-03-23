export interface LlmTraceInput {
  tenantId: string;
  conversationId?: string | null;
  caseId?: string | null;
  capabilityCode?: string | null;
  providerName: string;
  modelName: string;
  requestContractJson?: Record<string, unknown> | null;
  responseContractJson?: Record<string, unknown> | null;
  tokenInputCount?: number | null;
  tokenOutputCount?: number | null;
  latencyMs?: number | null;
  resultCode: string;
}
