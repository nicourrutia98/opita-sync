import type { OperateWorkspaceResponse as SharedOperateWorkspaceResponse } from '../../../../packages/api-client/src/index.js';

export type ThemeMode = 'light' | 'dark';

export interface ViewModelResponse {
  operate: {
    objective: string;
    contractStatus: string;
    policyState: string;
    releaseState: string;
    warnings: string[];
  };
  catalog: CatalogItemSummary[];
  inbox: InboxItemSummary[];
  activity: ActivityItemSummary[];
  governance: GovernanceSummary;
  settings: SettingsSummary;
}

export interface CatalogItemSummary {
  assetId: string;
  name: string;
  kind: 'action' | 'workflow';
  description: string;
  lifecycleState: string;
  version: string;
  approvalMode: string;
  classificationTags: string[];
  connectorIds: string[];
  publishedSemanticHash: string;
}

export interface InboxItemSummary {
  itemId: string;
  type: string;
  status: 'pending' | 'completed';
  summary: string;
  runId: string;
  actionLabel: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ActivityItemSummary {
  runId: string;
  objective: string;
  state: string;
  approvalState: string;
  releaseDecision: string;
  createdAt: string;
  updatedAt: string;
  actor: string;
}

export interface GovernanceRuleSummary {
  ruleId: string;
  effect: string;
  precedenceWeight: number;
  conditions: string[];
  obligations: string[];
  explanationTemplate: string;
}

export interface GovernanceSummary {
  policySetId: string;
  version: string;
  scope: string;
  status: string;
  classificationScheme: string;
  rules: GovernanceRuleSummary[];
  authorityMatrix: Array<{ dimension: string; description: string; roles: string[] }>;
  publicationControls: string[];
}

export interface SettingsSummary {
  tenantId: string;
  tenantName: string;
  defaultEnvironment: 'dev' | 'staging' | 'prod';
  preferredProvider: string;
  connectorNotes: string;
  environments: Array<'dev' | 'staging' | 'prod'>;
  activeProviders: string[];
  connectors: Array<{ connectorId: string; name: string; owner: string; status: string }>;
  credentials: Array<{ credentialScopeId: string; status: string; connectorId: string }>;
  authConfig: Array<{ label: string; value: string }>;
  providerStatus?: {
    providerId: string;
    configured: boolean;
    source: string;
    defaultModel: string;
    capabilities: string[];
  };
}

export interface RunTimelineEvent {
  occurredAt: string;
  label: string;
  stateFrom?: string;
  stateTo?: string;
  detail?: string;
}

export interface RunStepSummary {
  stepId: string;
  assetRef: string;
  status: string;
}

export interface RunDetailResponse {
  runId: string;
  objective: string;
  tenantId: string;
  environment: string;
  actor?: string;
  contractStatus: string;
  approvalMode: string;
  policyOutcome: string;
  classificationLevel: string;
  runState: string;
  releaseDecision: string;
  approvalState: string;
  warnings: string[];
  planSteps: RunStepSummary[];
  timeline: RunTimelineEvent[];
  outputArtifactContent?: string;
  lastUpdatedAt: string;
}

export interface RunListResponse {
  items: RunDetailResponse[];
}

export interface CommandRunResponse {
  ok: true;
  runId: string;
  runState: string;
  approvalState: string | null;
  releaseDecision: string | null;
  reasons?: string[];
}

export interface CommandSettingsResponse {
  ok: true;
  settings: SettingsSummary;
}

export type OperateWorkspaceResponse = SharedOperateWorkspaceResponse;

export interface OperateThreadPageResponse {
  messages: SharedOperateWorkspaceResponse['thread'];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ChatToolProposal {
  callId: string;
  name: string;
  argumentsJson: string;
  assetId?: string;
  intentSummary?: string;
  rationale?: string;
  requiresApproval?: boolean;
  riskNotes?: string[];
}

export interface ChatSessionResponse {
  ok: true;
  chatId: string;
  status: 'queued' | 'streaming' | 'completed' | 'failed' | 'cancelled';
  providerId: string;
  model: string;
  latestAssistantMessage: string;
  latestProposals: ChatToolProposal[];
  lastError?: string;
  lastErrorCode?: string;
  continuityMode?: 'manual' | 'provider' | 'fallback_manual';
  recoverableError?: string;
  interrupted?: boolean;
  stoppedAt?: string;
  stopReason?: 'user_stopped';
}

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthSession {
  sessionId: string;
  tenantId: string;
  expiresAt: string;
  lastSeenAt: string;
}

export interface AuthSessionResponse {
  ok: true;
  user: AuthenticatedUser;
  session: AuthSession;
}
