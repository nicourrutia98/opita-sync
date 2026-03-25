import type { ApprovalCase } from '../../approvals/src/index.js';
import type { ReleaseDecisionArtifact } from '../../output-control/src/index.js';
import type { Run } from '../../runtime/src/index.js';
import type { InboxItem } from './models.js';

export function projectInboxItems(input: { run?: Run; approvalCase?: ApprovalCase; releaseDecision?: ReleaseDecisionArtifact; }): InboxItem[] {
  const items: InboxItem[] = [];
  if (input.approvalCase && input.approvalCase.state === 'pending') items.push({ inboxItemId: `inbox:${input.approvalCase.approvalCaseId}`, itemType: 'approval', runId: input.approvalCase.runId, status: 'pending', summary: `Approval required for run ${input.approvalCase.runId}` });
  if (input.run && ['waiting_approval', 'step_failed_terminal'].includes(input.run.state)) items.push({ inboxItemId: `inbox:${input.run.runId}:intervention`, itemType: input.run.state === 'waiting_approval' ? 'intervention' : 'blocked_run', runId: input.run.runId, status: 'pending', summary: `Run ${input.run.runId} requires intervention (${input.run.state})` });
  if (input.releaseDecision && input.releaseDecision.decision === 'hold_for_approval') items.push({ inboxItemId: `inbox:${input.releaseDecision.releaseDecisionId}`, itemType: 'release_review', runId: input.releaseDecision.runId, status: 'pending', summary: `Release approval required for run ${input.releaseDecision.runId}` });
  return items;
}
