export type Role = "solicitante" | "tecnico" | "supervisor" | "admin";
export type ViewKey = "inicio" | "chat" | "casos" | "detalle" | "configuracion";
export type ThemeMode = "light" | "dark";
export type CaseStatus = "Nuevo" | "En curso" | "Bloqueado" | "Resuelto";
export type AuthErrorCode = "invalid_credentials" | "session_expired" | "access_denied" | "network_error" | "unknown";
export type ToolRiskLevel = "low" | "medium" | "high" | "critical";
export type PolicyMode = "suggest" | "confirm_then_execute" | "auto_execute";
export type ToolCertificationState = "draft" | "certified" | "deprecated";
export type EvidenceVisibility = "internal" | "supervisor_only";
export type AssistantRunPhase = "thinking" | "reasoning" | "using_tool" | "reading_context" | "drafting" | "completed" | "error" | "cancelled";
export type AssistantRunStatus = "queued" | "running" | "completed" | "error" | "cancelled";
export type TTSState = "idle" | "speaking" | "paused" | "error";

export interface RoleOption {
  id: Role;
  label: string;
  description: string;
}

export interface OperationalMetric {
  label: string;
  value: string;
  helper: string;
}

export interface CaseSummary {
  id: string;
  title: string;
  site: string;
  priority: "Alta" | "Media" | "Baja";
  status: CaseStatus;
  owner: string;
  updatedAt: string;
  summary: string;
}

export interface TimelineEntry {
  time: string;
  type: string;
  detail: string;
}

export interface CaseDetail extends CaseSummary {
  timeline: TimelineEntry[];
  suggestedAction: string;
}

export interface SupervisorQueueItem {
  title: string;
  detail: string;
  tone: "brand" | "warning" | "danger";
}

export interface DashboardData {
  metrics: OperationalMetric[];
  inbox: string[];
  supervisorQueue: SupervisorQueueItem[];
  supervisorSignals: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  runId?: string;
}

export interface ConversationState {
  id: string;
  title: string;
  caseId?: string;
  promptDraft: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  caseId?: string;
  lastMessagePreview: string;
  updatedAt: string;
  createdAt?: string;
  archivedAt?: string;
  status?: AssistantRunStatus;
}

export interface ConversationMessagePage {
  items: ChatMessage[];
  prevCursor: string | null;
  hasMoreBefore: boolean;
}

export interface RunStatusSnapshot {
  runId: string;
  conversationId: string;
  messageId?: string;
  status: AssistantRunStatus;
  phase: AssistantRunPhase;
  label: string;
  detail?: string;
  provider?: string;
  model?: string;
  error?: string;
}

export interface SendMessageResult {
  runId: string;
  conversationId: string;
  userMessage: ChatMessage;
  assistantDraftMessage: ChatMessage;
  reusedUserMessageId?: string;
  conversationSummary?: ConversationSummary;
}

export interface SendMessageInput {
  conversationId: string;
  caseId?: string;
  content: string;
  attachments?: Array<{ id: string; name: string }>;
  metadata?: Record<string, string>;
}

export interface ListConversationsInput {
  limit?: number;
}

export interface CreateConversationInput {
  caseId?: string;
}

export interface UpdateConversationInput {
  conversationId: string;
  title?: string;
  archived?: boolean;
}

export interface ConversationMessagesInput {
  conversationId: string;
  limit?: number;
  before?: string;
}

export interface CancelRunInput {
  runId: string;
}

export type ChatStreamEvent =
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
      phase: AssistantRunPhase;
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
      message: ChatMessage;
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

export interface ChatTransport {
  listConversations(input?: ListConversationsInput): Promise<ConversationSummary[]>;
  createConversation(input?: CreateConversationInput): Promise<ConversationSummary>;
  updateConversation(input: UpdateConversationInput): Promise<ConversationSummary>;
  getConversationMessages(input: ConversationMessagesInput): Promise<ConversationMessagePage>;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  retryLastMessage(input: { conversationId: string }): Promise<SendMessageResult>;
  streamAssistantResponse(input: { conversationId: string; runId: string; signal?: AbortSignal; onEvent: (event: ChatStreamEvent) => void }): Promise<void>;
  cancelRun(input: CancelRunInput): Promise<void>;
  subscribeConversationUpdates?(input: { onConversationUpdated: (conversation: ConversationSummary) => void }): () => void;
}

export interface AssistantConnectionStatus {
  ok: boolean;
  provider: string;
  model: string;
  detail: string;
}

export interface TenantConfigData {
  activeCapabilities: string;
  limits: string;
  risks: string[];
  parameters: TenantParameter[];
}

export interface TenantParameter {
  key: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface OperationalLogEntry {
  id: string;
  caseId: string;
  author: string;
  type: string;
  detail: string;
  createdAt: string;
  visibility: EvidenceVisibility;
  before?: string;
  after?: string;
  evidenceLabel?: string;
  auditId: string;
}

export interface OperationalLogCreateInput {
  caseId: string;
  type: string;
  detail: string;
  visibility: EvidenceVisibility;
  before?: string;
  after?: string;
  evidenceLabel?: string;
}

export interface CapabilityItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  policyMode: PolicyMode;
  requiresApproval: boolean;
}

export interface ToolGovernanceItem {
  id: string;
  name: string;
  capabilityId: string;
  riskLevel: ToolRiskLevel;
  certification: ToolCertificationState;
  environment: "staging" | "production";
  maxPolicyMode: PolicyMode;
  tenantOverrideAllowed: boolean;
  blockedReason?: string;
}

export interface AssistedDraft {
  id: string;
  caseId: string;
  channel: "interno" | "cliente";
  tone: string;
  content: string;
  requiresApproval: boolean;
  status: "ready" | "pending_approval";
  auditId: string;
}

export interface DraftRequestInput {
  caseId: string;
  prompt: string;
  channel: "interno" | "cliente";
  tone: string;
}

export interface ValueMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  positiveImpact: string;
}

export interface ValueReport {
  periodLabel: string;
  metrics: ValueMetric[];
}

export interface UsageAttribution {
  tenantId: string;
  periodLabel: string;
  successfulActions: number;
  totalEstimatedTokens: number;
}

export interface BillingExportResult {
  exportId: string;
  generatedAt: string;
  rows: number;
}

export interface GlobalGovernanceState {
  releaseChannel: "staging" | "production";
  capabilitiesCertified: number;
  toolsCertified: number;
  lastDeploymentAt: string;
  rollbackReady: boolean;
}

export interface GlobalGovernanceActionResult {
  action: "approve_capability" | "deploy_release" | "rollback_release";
  status: "success" | "blocked";
  auditId: string;
  detail: string;
}

export interface RetentionPolicy {
  tenantId: string;
  operationalRetentionDays: number;
  auditRetentionDays: number;
  anonymizationRequiredForReuse: boolean;
  dataReuseDefaultOptIn: boolean;
}

export interface DataReuseConsent {
  tenantId: string;
  enabled: boolean;
  updatedAt: string;
  auditId: string;
}

export interface NavigationManifestByRole {
  role: Role;
  primaryViews: ViewKey[];
  backofficeViews: ViewKey[];
}

export interface TenantScope {
  id: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AccessBootstrap {
  user: AuthenticatedUser;
  tenant: TenantScope;
  role: Role;
  allowedViews: ViewKey[];
}

export interface SessionState {
  accessToken: string;
  expiresAt: string;
  bootstrap: AccessBootstrap;
}

export const roles: RoleOption[] = [
  { id: "solicitante", label: "Solicitante", description: "Reporta, consulta y hace seguimiento desde móvil." },
  { id: "tecnico", label: "Técnico", description: "Opera casos, bitácora y comunicación asistida." },
  { id: "supervisor", label: "Supervisor", description: "Gestiona bloqueos, aprobaciones y valor operativo." },
  { id: "admin", label: "Administrador", description: "Organiza ajustes, herramientas y seguimiento general." }
];

export const actorViews: Record<Role, ViewKey[]> = {
  solicitante: ["inicio", "chat", "casos", "detalle"],
  tecnico: ["inicio", "chat", "casos", "detalle"],
  supervisor: ["inicio", "chat", "casos", "detalle"],
  admin: ["chat", "inicio", "casos", "detalle", "configuracion"]
};

export const viewLabels: Record<ViewKey, string> = {
  inicio: "Inicio",
  chat: "Chat",
  casos: "Casos",
  detalle: "Detalle",
  configuracion: "Configuración"
};

export const defaultCaseId = "CAS-2048";
