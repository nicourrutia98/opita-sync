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
  environments: Array<'dev' | 'staging' | 'prod'>;
  activeProviders: string[];
  connectors: Array<{ connectorId: string; name: string; owner: string; status: string }>;
  credentials: Array<{ credentialScopeId: string; status: string; connectorId: string }>;
  authConfig: Array<{ label: string; value: string }>;
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
