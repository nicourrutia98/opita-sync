export interface DashboardDto {
  metrics: Array<{ label: string; value: string; helper: string }>;
  inbox: string[];
  supervisorMetrics: Array<{ label: string; value: string; helper: string }>;
  supervisorQueue: Array<{ title: string; detail: string; tone: "brand" | "warning" | "danger" }>;
  supervisorSignals: string[];
}

export interface CaseSummaryDto {
  id: string;
  title: string;
  site: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Nuevo" | "En curso" | "Bloqueado" | "Resuelto";
  owner: string;
  updatedAt: string;
  summary: string;
}

export interface CaseDetailDto extends CaseSummaryDto {
  timeline: Array<{ time: string; type: string; detail: string }>;
  suggestedAction: string;
}

export interface ConversationDto {
  id: string;
  title: string;
  caseId?: string;
  promptDraft: string;
  updatedAt: string;
  createdAt?: string;
  archivedAt?: string;
}

export interface ConversationSummaryDto {
  id: string;
  title: string;
  caseId?: string;
  lastMessagePreview: string;
  updatedAt: string;
  createdAt?: string;
  archivedAt?: string;
  status?: "queued" | "running" | "completed" | "error" | "cancelled";
}

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  runId?: string;
}

export interface ConversationMessagePageDto {
  items: ConversationMessageDto[];
  prevCursor: string | null;
  hasMoreBefore: boolean;
}

export interface SendChatMessageDto {
  content: string;
  attachments?: Array<{ id: string; name: string }>;
  metadata?: Record<string, string>;
}

export interface SendChatMessageResultDto {
  runId: string;
  conversationId: string;
  userMessage: ConversationMessageDto;
  assistantDraftMessage: ConversationMessageDto;
  reusedUserMessageId?: string;
  conversationSummary?: ConversationSummaryDto;
}

export type ChatStreamEventDto =
  | {
      type: "run.started";
      runId: string;
      conversationId: string;
      messageId: string;
      userMessageId: string;
      assistantDraftMessageId: string;
      createdAt: string;
    }
  | {
      type: "status.changed";
      runId: string;
      conversationId: string;
      messageId?: string;
      phase: "thinking" | "reasoning" | "using_tool" | "reading_context" | "drafting" | "completed" | "error" | "cancelled";
      label: string;
      detail?: string;
    }
  | {
      type: "context.reading" | "reasoning.started";
      runId: string;
      conversationId: string;
      messageId?: string;
      detail?: string;
    }
  | {
      type: "tool.started" | "tool.progress" | "tool.completed" | "tool.failed";
      runId: string;
      conversationId: string;
      messageId?: string;
      toolCallId: string;
      toolName: string;
      detail?: string;
      createdAt: string;
    }
  | {
      type: "message.delta";
      runId: string;
      conversationId: string;
      messageId: string;
      delta: string;
    }
  | {
      type: "message.completed";
      runId: string;
      conversationId: string;
      message: ConversationMessageDto;
    }
  | {
      type: "run.completed";
      runId: string;
      conversationId: string;
      provider?: string;
      model?: string;
    }
  | {
      type: "run.error";
      runId: string;
      conversationId: string;
      error: string;
    }
  | {
      type: "run.cancelled";
      runId: string;
      conversationId: string;
    };

export interface AssistantConnectionStatusDto {
  ok: boolean;
  provider: string;
  model: string;
  detail: string;
}

export interface TenantConfigDto {
  activeCapabilities: string;
  limits: string;
  risks: string[];
  parameters: Array<{
    key: string;
    label: string;
    value: string;
    editable: boolean;
  }>;
}

export interface OperationalLogEntryDto {
  id: string;
  caseId: string;
  author: string;
  type: string;
  detail: string;
  createdAt: string;
  visibility: "internal" | "supervisor_only";
  before?: string;
  after?: string;
  evidenceLabel?: string;
  auditId: string;
}

export interface CreateOperationalLogEntryDto {
  caseId: string;
  type: string;
  detail: string;
  visibility: "internal" | "supervisor_only";
  before?: string;
  after?: string;
  evidenceLabel?: string;
}

export interface CapabilityDto {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  policyMode: "suggest" | "confirm_then_execute" | "auto_execute";
  requiresApproval: boolean;
}

export interface SetCapabilityStateDto {
  capabilityId: string;
  enabled: boolean;
}

export interface ToolGovernanceDto {
  id: string;
  name: string;
  capabilityId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  certification: "draft" | "certified" | "deprecated";
  environment: "staging" | "production";
  maxPolicyMode: "suggest" | "confirm_then_execute" | "auto_execute";
  tenantOverrideAllowed: boolean;
  blockedReason?: string;
}

export interface UpdateTenantParameterDto {
  key: string;
  value: string;
}

export interface MutationResponseDto {
  updated: boolean;
  auditId: string;
}

export interface DraftRequestDto {
  caseId: string;
  prompt: string;
  channel: "interno" | "cliente";
  tone: string;
}

export interface DraftResponseDto {
  id: string;
  caseId: string;
  channel: "interno" | "cliente";
  tone: string;
  content: string;
  requiresApproval: boolean;
  status: "ready" | "pending_approval";
  auditId: string;
}

export interface ValueMetricDto {
  id: string;
  label: string;
  value: string;
  trend: string;
  positiveImpact: string;
}

export interface ValueReportDto {
  periodLabel: string;
  metrics: ValueMetricDto[];
}

export interface UsageAttributionDto {
  tenantId: string;
  periodLabel: string;
  successfulActions: number;
  totalEstimatedTokens: number;
}

export interface BillingExportDto {
  exportId: string;
  generatedAt: string;
  rows: number;
}

export interface GlobalGovernanceStateDto {
  releaseChannel: "staging" | "production";
  capabilitiesCertified: number;
  toolsCertified: number;
  lastDeploymentAt: string;
  rollbackReady: boolean;
}

export interface GlobalGovernanceActionDto {
  action: "approve_capability" | "deploy_release" | "rollback_release";
}

export interface GlobalGovernanceActionResultDto {
  action: "approve_capability" | "deploy_release" | "rollback_release";
  status: "success" | "blocked";
  auditId: string;
  detail: string;
}

export interface RetentionPolicyDto {
  tenantId: string;
  operationalRetentionDays: number;
  auditRetentionDays: number;
  anonymizationRequiredForReuse: boolean;
  dataReuseDefaultOptIn: boolean;
}

export interface DataReuseConsentDto {
  tenantId: string;
  enabled: boolean;
  updatedAt: string;
  auditId: string;
}

export interface UpdateDataReuseConsentDto {
  enabled: boolean;
}

export interface NavigationManifestDto {
  role: "solicitante" | "tecnico" | "supervisor" | "admin";
  primaryViews: Array<"inicio" | "chat" | "casos" | "detalle" | "configuracion">;
  backofficeViews: Array<"inicio" | "chat" | "casos" | "detalle" | "configuracion">;
}

export interface SignInRequestDto {
  email: string;
  password: string;
}

export interface SignInResponseDto {
  accessToken: string;
  expiresAt: string;
  bootstrap: SessionDto;
}

export interface SessionDto {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  role: "solicitante" | "tecnico" | "supervisor" | "admin";
  allowedViews: Array<"inicio" | "chat" | "casos" | "detalle" | "configuracion">;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  password: string;
}
