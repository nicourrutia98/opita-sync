import type { ApprovalMode } from '../../contracts/src/index.js';
import type { PolicyOutcome } from '../../domain/src/index.js';

export interface InterpretedIntentArtifact {
  artifactId: string;
  contractId: string;
  contractRevision: number;
  inferredIntentType: 'catalog_action' | 'catalog_workflow' | 'operate_request';
  ambiguityFlags: string[];
  candidateAssetRefs: string[];
}

export type AdmissibilityStatus = 'admissible' | 'denied' | 'approval_required' | 'restricted';

export interface AdmissibilityDecisionArtifact {
  decisionId: string;
  contractRef: string;
  status: AdmissibilityStatus;
  policyOutcome: PolicyOutcome;
  restrictions: string[];
  reasons: string[];
  requiredApprovalMode?: ApprovalMode;
}

export interface CapabilitySelectionResult {
  selectionId: string;
  selectedAssetRefs: string[];
  dynamicCompositionUsed: boolean;
  blockedReason?: string;
}

export interface ExecutionPlanStep {
  stepId: string;
  assetRef: string;
  kind: 'action' | 'workflow_step';
  connectorIds: string[];
}

export interface ExecutionPlanArtifact {
  planId: string;
  contractRef: string;
  admissibilityDecisionRef: string;
  status: 'compiled' | 'blocked';
  selectedAssetRefs: string[];
  steps: ExecutionPlanStep[];
  approvalMode: ApprovalMode;
  outputCheckpointRequired: boolean;
  blockedReason?: string;
}
