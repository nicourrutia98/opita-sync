import assert from 'node:assert/strict';
import test from 'node:test';

import { createApprovalCase, transitionApprovalCase } from '../../packages/approvals/src/index.js';
import { createExecutionContract } from '../../packages/contracts/src/index.js';
import { executeCompiledPlan, resumeRunAfterApproval } from '../../packages/runtime/src/index.js';
import type { ExecutionPlanArtifact } from '../../packages/orchestrator/src/index.js';
import { projectInboxItems } from '../../packages/inbox/src/index.js';

function plan(approvalMode: ExecutionPlanArtifact['approvalMode']): ExecutionPlanArtifact {
  return { planId: 'plan_1', contractRef: 'contract:contract_1:r1', admissibilityDecisionRef: 'decision_1', status: 'compiled', selectedAssetRefs: ['action_1'], steps: [{ stepId: 'step_1', assetRef: 'action_1', kind: 'action', connectorIds: [] }], approvalMode, outputCheckpointRequired: true };
}

function contract() {
  return createExecutionContract({ contractId: 'contract_1', revision: 1, tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'chat', objectiveText: 'Governed execution', requestedOutcome: 'action_execution', successCriteria: ['done'], urgency: 'normal', domainContext: 'operate', includedEntities: [], excludedEntities: [], allowedDataDomains: [], excludedDataDomains: [], allowedExternalEffectClass: 'draft_only', dynamicCompositionRequested: false, classificationCeiling: 'confidential', allowedConnectorIds: [], allowedCredentialScopeIds: [], approvalExpectationMode: 'pre-execution', draftGenerationAllowed: true, applyAllowed: false, sendAllowed: false, outputSensitivityExpectation: 'governed_output_required', desiredOutputForm: 'summary', disclosureAudience: 'initiator', exportRequested: false, sendRequested: false, draftOnly: true, userConstraints: [], systemConstraints: [], policyConstraints: [], classificationConstraints: [], status: 'admissible' });
}

test('pre-execution approval pauses run and projects inbox item', () => {
  const result = executeCompiledPlan({ contract: contract(), plan: plan('pre-execution') });
  assert.equal(result.run.state, 'waiting_approval');
  const approval = createApprovalCase({ approvalCaseId: 'approval_1', runId: result.run.runId, contractId: 'contract_1', contractRevision: 1, mode: 'pre-execution', approverIds: ['approver_1'], evidenceRefs: [] });
  const inbox = projectInboxItems({ run: result.run, approvalCase: approval });
  assert.equal(inbox.length, 2);
});

test('approved pre-execution gate resumes same run identity and completes execution', () => {
  const initial = executeCompiledPlan({ contract: contract(), plan: plan('pre-execution') });
  const approval = createApprovalCase({ approvalCaseId: 'approval_1', runId: initial.run.runId, contractId: 'contract_1', contractRevision: 1, mode: 'pre-execution', approverIds: ['approver_1'], evidenceRefs: [] });
  const approved = transitionApprovalCase(approval, 'approved', 'approver_1').approvalCase;
  const resumedRun = resumeRunAfterApproval(initial.run, approved);
  const completed = executeCompiledPlan({ contract: contract(), plan: plan('auto'), preExecutionApprovalCase: approved });
  assert.equal(resumedRun.runId, initial.run.runId);
  assert.equal(completed.run.state, 'execution_completed');
  assert.equal(completed.steps.length, 1);
});
