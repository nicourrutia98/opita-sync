export interface ToolExecutionAttemptInput {
  tenantId: string;
  conversationId?: string | null;
  caseId?: string | null;
  actorUserId?: string | null;
  intentCode?: string | null;
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  executionMode: 'SUGGEST' | 'CONFIRM_THEN_EXECUTE' | 'AUTO_EXECUTE';
  confirmationRequired?: boolean;
  confirmationStatus?:
    | 'NOT_REQUIRED'
    | 'PENDING'
    | 'CONFIRMED'
    | 'REJECTED';
  executionResult:
    | 'SUCCESS'
    | 'FAILED'
    | 'BLOCKED'
    | 'REQUIRES_CONFIRMATION';
  requestPayloadJson?: Record<string, unknown> | null;
  responsePayloadJson?: Record<string, unknown> | null;
}

export interface PositiveActionInput {
  tenantId: string;
  conversationId?: string | null;
  caseId?: string | null;
  actorUserId?: string | null;
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  executionAttemptId: string;
  auditEventId?: string | null;
  providerTraceId?: string | null;
}

export interface ConfirmationRequestInput {
  tenantId: string;
  conversationId?: string | null;
  caseId?: string | null;
  actorUserId: string;
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  confirmationCode: string;
  requestedPayloadJson: Record<string, unknown>;
  expiresAt: Date;
}
