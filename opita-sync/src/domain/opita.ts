export type Role = "solicitante" | "tecnico" | "supervisor" | "admin";
export type ViewKey = "inicio" | "chat" | "casos" | "detalle" | "configuracion";
export type ThemeMode = "light" | "dark";
export type CaseStatus = "Nuevo" | "En curso" | "Bloqueado" | "Resuelto";
export type AuthErrorCode = "invalid_credentials" | "session_expired" | "access_denied" | "network_error" | "unknown";
export type ToolRiskLevel = "low" | "medium" | "high" | "critical";
export type PolicyMode = "suggest" | "confirm_then_execute" | "auto_execute";
export type ToolCertificationState = "draft" | "certified" | "deprecated";
export type EvidenceVisibility = "internal" | "supervisor_only";

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
  tone: "user" | "assistant" | "system";
  body: string;
}

export interface ConversationState {
  title: string;
  promptDraft: string;
  messages: ChatMessage[];
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
  { id: "solicitante", label: "Solicitante", description: "Reporta, consulta y hace seguimiento desde movil." },
  { id: "tecnico", label: "Tecnico", description: "Opera casos, bitacora y comunicacion asistida." },
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
  configuracion: "Configuracion"
};

export const defaultCaseId = "CAS-2048";
