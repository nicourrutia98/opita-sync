import type { ApprovalCase } from '../../../packages/approvals/src/index.js';
import type { CatalogAsset } from '../../../packages/catalog/src/index.js';
import type { ClassificationEvaluationArtifact } from '../../../packages/classification/src/index.js';
import type { ExecutionContract } from '../../../packages/contracts/src/index.js';
import type { InboxItem } from '../../../packages/inbox/src/index.js';
import type { AdmissibilityDecisionArtifact, ExecutionPlanArtifact } from '../../../packages/orchestrator/src/index.js';
import type { PolicyDecisionArtifact, PolicySet } from '../../../packages/policy-engine/src/index.js';
import type { ReleaseDecisionArtifact } from '../../../packages/output-control/src/index.js';
import type { Run, RunEvent } from '../../../packages/runtime/src/index.js';

export interface RunRecord {
  runId: string;
  contract: ExecutionContract;
  admissibility: AdmissibilityDecisionArtifact;
  policyDecision: PolicyDecisionArtifact;
  classification: ClassificationEvaluationArtifact;
  plan: ExecutionPlanArtifact;
  run: Run;
  approvalCase?: ApprovalCase;
  releaseDecision?: ReleaseDecisionArtifact;
  inboxItems: InboxItem[];
  runtimeEvents: RunEvent[];
}

export interface ApiState {
  version: 1;
  updatedAt: string;
  policySet: PolicySet;
  catalog: CatalogAsset[];
  runRecords: RunRecord[];
}
