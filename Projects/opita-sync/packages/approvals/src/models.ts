import type { ApprovalMode } from '../../contracts/src/index.js';

export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked' | 'escalated' | 'superseded';

export interface ApprovalCase {
  approvalCaseId: string;
  runId: string;
  runStepId?: string;
  contractId: string;
  contractRevision: number;
  mode: ApprovalMode;
  state: ApprovalState;
  requestedAt: string;
  decidedAt?: string;
  approverIds: string[];
  evidenceRefs: string[];
}

export interface ApprovalTransition {
  approvalCaseId: string;
  from: ApprovalState;
  to: ApprovalState;
  actorId: string;
  occurredAt: string;
  reason?: string;
}
