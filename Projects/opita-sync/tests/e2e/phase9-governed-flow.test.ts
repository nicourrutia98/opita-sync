import assert from 'node:assert/strict';
import test from 'node:test';

import type { ActionAsset } from '../../packages/catalog/src/index.js';
import { createContractRevision } from '../../packages/contracts/src/index.js';
import { buildContractFromNormalizedIntent, normalizeIntent } from '../../packages/application/src/index.js';
import { computeEffectiveAuthority } from '../../packages/authority/src/index.js';
import { evaluatePolicy, type PolicySet } from '../../packages/policy-engine/src/index.js';
import { evaluateClassification } from '../../packages/classification/src/index.js';
import { compileExecutionPlan, evaluateAdmissibility, selectCapabilities } from '../../packages/orchestrator/src/index.js';
import { createApprovalCase, transitionApprovalCase } from '../../packages/approvals/src/index.js';
import { executeCompiledPlan } from '../../packages/runtime/src/index.js';
import { analyzeMixedAuthority, decideRelease } from '../../packages/output-control/src/index.js';
import type { RoleAssignment } from '../../packages/domain/src/index.js';
import { createAuditEvent } from '../../packages/audit/src/index.js';
import { projectInboxItems } from '../../packages/inbox/src/index.js';
import { assertConnectorInvocationAllowed, type ConnectorInstance } from '../../packages/connectors/src/index.js';

const action: ActionAsset = { assetId: 'action_customer_followup', assetKind: 'action', name: 'Customer Follow-up', description: 'Prepare customer follow-up draft', lifecycleState: 'published', version: '1.0.0', approvalMode: 'pre-application', classificationTags: ['customer'], connectorIds: ['connector_email'], publishedSemanticHash: 'hash_followup_v1', inputContractRef: 'input:v1', outputContractRef: 'output:v1' };
const roleAssignments: RoleAssignment[] = [{ tenantId: 'tenant_1', userId: 'user_1', roleId: 'end_user', grantedAt: '2026-01-01T00:00:00.000Z', grantedBy: 'tenant_admin_1' }];
const policySet: PolicySet = { policySetId: 'policy_e2e', version: '1.0.0', scope: 'tenant', status: 'active', rules: [{ ruleId: 'allow_customer', effect: 'allow', precedenceWeight: 1, conditions: ['domain=customer'], explanationTemplate: 'Allowed customer draft.' }] };
const connector: ConnectorInstance = { connectorId: 'connector_email', connectorType: 'email', environments: ['dev'], credentialScopeIds: ['cred_email'], active: true };

test('full governed happy path reaches release after approval and connector guardrails', () => {
  const normalized = normalizeIntent({ tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'catalog_launch', rawIntent: 'Prepare a customer follow-up draft', requestedActionAssetId: 'action_customer_followup' });
  const contract = buildContractFromNormalizedIntent({ tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'catalog_launch', rawIntent: 'Prepare a customer follow-up draft', requestedActionAssetId: 'action_customer_followup', contractId: 'contract_e2e', revision: 1, normalized });
  const revisedContract = { ...contract, allowedConnectorIds: ['connector_email'], allowedCredentialScopeIds: ['cred_email'], allowedDataDomains: ['customer'] };
  const revision = createContractRevision({ previous: contract, next: revisedContract, actorId: 'user_1' });
  assert.equal(revision.governanceRelevantChange, true);
  const authority = computeEffectiveAuthority({ subjectUserId: 'user_1', tenantId: 'tenant_1', environment: 'dev', roleAssignments, visibleAssetIds: ['action_customer_followup'], usableAssetIds: ['action_customer_followup'], dataDomains: ['customer'] });
  const policyDecision = evaluatePolicy({ policySet, matchedRuleIds: ['allow_customer'] });
  const classification = evaluateClassification({ artifactId: 'classification_e2e', classification: { level: 'confidential', tags: ['customer'] }, ceiling: 'confidential', mixedAuthority: false });
  const admissibility = evaluateAdmissibility({ contract: revisedContract, effectiveAuthority: authority, policyDecision, classificationEvaluation: classification });
  assert.equal(admissibility.status, 'admissible');
  const selection = selectCapabilities({ contract: revisedContract, assets: [action], effectiveAuthority: authority });
  const plan = compileExecutionPlan({ contract: revisedContract, admissibilityDecision: admissibility, selection, assets: [action] });
  assert.equal(plan.status, 'compiled');
  const connectorReceipt = assertConnectorInvocationAllowed({ invocationId: 'inv_e2e', connectorId: 'connector_email', environment: 'dev', source: 'compiled_runtime_step', runtimeApproved: true, credentialScopeId: 'cred_email' }, [connector]);
  assert.equal(connectorReceipt.accepted, true);
  const execution = executeCompiledPlan({ contract: revisedContract, plan });
  assert.equal(execution.run.state, 'execution_completed');
  const approval = createApprovalCase({ approvalCaseId: 'approval_e2e', runId: execution.run.runId, contractId: revisedContract.contractId, contractRevision: revisedContract.revision, mode: 'pre-application', approverIds: ['approver_1'], evidenceRefs: [] });
  const approved = transitionApprovalCase(approval, 'approved', 'approver_1').approvalCase;
  const outputArtifact = { outputArtifactId: 'output_e2e', runId: execution.run.runId, artifactType: 'user_visible' as const, classificationMarks: ['confidential'], generatedAt: '2026-01-01T00:00:00.000Z', content: execution.outputDraft };
  const mixed = analyzeMixedAuthority({ outputArtifact, allowedContentDetected: true, disallowedContentDetected: false, rationale: 'Allowed customer content only.' });
  const release = decideRelease({ outputArtifact, mixedAuthorityAnalysis: mixed, classificationEvaluation: classification, policyDecision, approvalCase: approved });
  assert.equal(release.decision, 'release');
  const auditEvent = createAuditEvent({ eventId: 'evt_e2e', eventType: 'output.release_decided', tenantId: 'tenant_1', actorId: 'system', payload: { summary: 'Release approved.', refs: [release.releaseDecisionId] } });
  assert.equal(auditEvent.eventType, 'output.release_decided');
});

test('mixed-authority path blocks output and creates actionable inbox item', () => {
  const normalized = normalizeIntent({ tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'chat', rawIntent: 'Draft a customer and restricted mixed summary' });
  const contract = buildContractFromNormalizedIntent({ tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'chat', rawIntent: 'Draft a customer and restricted mixed summary', contractId: 'contract_block', revision: 1, normalized });
  const authority = computeEffectiveAuthority({ subjectUserId: 'user_1', tenantId: 'tenant_1', environment: 'dev', roleAssignments, visibleAssetIds: [], usableAssetIds: [], dataDomains: ['customer'] });
  const policyDecision = evaluatePolicy({ policySet, matchedRuleIds: ['allow_customer'] });
  const classification = evaluateClassification({ artifactId: 'classification_block', classification: { level: 'confidential', tags: ['customer'] }, ceiling: 'confidential', mixedAuthority: true });
  const outputArtifact = { outputArtifactId: 'output_block', runId: 'run_block', artifactType: 'user_visible' as const, classificationMarks: ['confidential', 'restricted'], generatedAt: '2026-01-01T00:00:00.000Z', content: 'Mixed output' };
  const mixed = analyzeMixedAuthority({ outputArtifact, allowedContentDetected: true, disallowedContentDetected: true, rationale: 'Mixed authority content.' });
  const release = decideRelease({ outputArtifact, mixedAuthorityAnalysis: mixed, classificationEvaluation: classification, policyDecision });
  const inbox = projectInboxItems({ run: { runId: 'run_block', tenantId: 'tenant_1', environment: 'dev', contractId: contract.contractId, contractRevision: contract.revision, planSnapshot: { planId: 'plan_block', contractRef: 'contract:contract_block:r1', admissibilityDecisionRef: 'decision_block', status: 'compiled', selectedAssetRefs: [], steps: [], approvalMode: 'auto', outputCheckpointRequired: true }, state: 'waiting_approval', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }, releaseDecision: release });
  assert.equal(authority.canGenerateDraft, true);
  assert.equal(release.decision, 'block');
  assert.ok(inbox.some((item) => item.itemType === 'intervention'));
});
