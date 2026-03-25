import type { ApprovalCase, ApprovalState, ApprovalTransition } from './models.js';

const ALLOWED_TRANSITIONS: Record<ApprovalState, ApprovalState[]> = {
  pending: ['approved', 'rejected', 'expired', 'revoked', 'escalated'],
  approved: ['superseded'],
  rejected: [],
  expired: [],
  revoked: [],
  escalated: ['approved', 'rejected', 'expired', 'revoked'],
  superseded: []
};

export function createApprovalCase(input: Omit<ApprovalCase, 'state' | 'requestedAt'> & Partial<Pick<ApprovalCase, 'state' | 'requestedAt'>>): ApprovalCase {
  return { ...input, state: input.state ?? 'pending', requestedAt: input.requestedAt ?? new Date().toISOString() };
}

export function transitionApprovalCase(caseRef: ApprovalCase, to: ApprovalState, actorId: string, reason?: string): { approvalCase: ApprovalCase; transition: ApprovalTransition; } {
  if (!ALLOWED_TRANSITIONS[caseRef.state].includes(to)) throw new Error(`Invalid approval transition from ${caseRef.state} to ${to}`);
  const occurredAt = new Date().toISOString();
  return {
    approvalCase: { ...caseRef, state: to, decidedAt: ['approved', 'rejected', 'expired', 'revoked', 'superseded'].includes(to) ? occurredAt : undefined },
    transition: { approvalCaseId: caseRef.approvalCaseId, from: caseRef.state, to, actorId, occurredAt, reason }
  };
}
