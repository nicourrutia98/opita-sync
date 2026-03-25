import type { Environment } from '../../domain/src/index.js';

export type ApprovalMode = 'auto' | 'pre-execution' | 'pre-application' | 'double_approval';
export type AllowedFinalAction = 'draft_only' | 'apply_capable' | 'send_capable';
export type RequestedAnalysisMode = 'inspect' | 'summarize' | 'aggregate' | 'visualize';

export type ContractStatus =
  | 'draft'
  | 'normalized'
  | 'restricted'
  | 'approval_required'
  | 'admissible'
  | 'denied'
  | 'compiled'
  | 'executed'
  | 'release_resolved';

export type ContractSourceType = 'chat' | 'catalog_launch' | 'automation_event';

export interface ContractTimeWindow {
  startsAt?: string;
  endsAt?: string;
}

export interface ExecutionContract {
  contractId: string;
  revision: number;
  tenantId: string;
  environment: Environment;
  initiatorUserId: string;
  authorityContextId: string;
  sourceType: ContractSourceType;
  createdAt: string;
  updatedAt: string;
  objectiveText: string;
  requestedOutcome: string;
  successCriteria: string[];
  urgency: 'low' | 'normal' | 'high';
  domainContext: string;
  includedEntities: string[];
  excludedEntities: string[];
  allowedDataDomains: string[];
  excludedDataDomains: string[];
  allowedTimeWindow?: ContractTimeWindow;
  allowedExternalEffectClass: 'none' | 'draft_only' | 'internal_apply' | 'external_send';
  requestedActionAssetId?: string;
  requestedWorkflowAssetId?: string;
  targetDatasetRefs?: string[];
  requestedAnalysisMode?: RequestedAnalysisMode;
  requestedChartFamily?: string;
  candidateActionFamily?: string;
  candidateWorkflowFamily?: string;
  dynamicCompositionRequested: boolean;
  classificationCeiling: 'internal' | 'confidential' | 'restricted' | 'high_impact';
  allowedConnectorIds: string[];
  allowedCredentialScopeIds: string[];
  delegationContextId?: string;
  approvalExpectationMode: ApprovalMode;
  draftGenerationAllowed: boolean;
  applyAllowed: boolean;
  sendAllowed: boolean;
  outputSensitivityExpectation: string;
  desiredOutputForm: string;
  disclosureAudience: string;
  exportRequested: boolean;
  sendRequested: boolean;
  draftOnly: boolean;
  userConstraints: string[];
  systemConstraints: string[];
  policyConstraints: string[];
  classificationConstraints: string[];
  status: ContractStatus;
}

export interface ContractRevision {
  contractId: string;
  revision: number;
  previousRevision?: number;
  changedFields: string[];
  governanceRelevantChange: boolean;
  createdAt: string;
  actorId: string;
  snapshot: ExecutionContract;
}

export interface AdmissibilityRequestEnvelope {
  contractSnapshotRef: string;
  effectiveAuthorityRef: string;
  policySnapshotRef?: string;
  classificationContextRef: string;
  requestedEnvironment: Environment;
  requestedAssetRefs: string[];
  requestedConnectorRefs: string[];
}

export interface EffectiveContractSummary {
  objective: string;
  scopeSummary: string;
  allowedDataDomains: string[];
  allowedConnectorIds: string[];
  delegationApplied: boolean;
  approvalMode: ApprovalMode;
  allowedFinalAction: AllowedFinalAction;
  releaseState: string;
  runState: string;
}
