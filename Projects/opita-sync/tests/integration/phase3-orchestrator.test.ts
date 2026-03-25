import assert from 'node:assert/strict';
import test from 'node:test';

import type { ActionAsset } from '../../packages/catalog/src/index.js';
import { createExecutionContract } from '../../packages/contracts/src/index.js';
import { computeEffectiveAuthority } from '../../packages/authority/src/index.js';
import { evaluatePolicy, type PolicySet } from '../../packages/policy-engine/src/index.js';
import { evaluateClassification } from '../../packages/classification/src/index.js';
import { compileExecutionPlan, evaluateAdmissibility, selectCapabilities } from '../../packages/orchestrator/src/index.js';
import type { RoleAssignment } from '../../packages/domain/src/index.js';

const asset: ActionAsset = {
  assetId: 'action_governed_send',
  assetKind: 'action',
  name: 'Governed Send',
  description: 'Send within policy constraints',
  lifecycleState: 'published',
  version: '1.0.0',
  approvalMode: 'auto',
  classificationTags: ['customer'],
  connectorIds: ['connector_email'],
  publishedSemanticHash: 'hash_send_v1',
  inputContractRef: 'input:v1',
  outputContractRef: 'output:v1'
};

const roleAssignments: RoleAssignment[] = [
  { tenantId: 'tenant_1', userId: 'user_1', roleId: 'end_user', grantedAt: '2026-01-01T00:00:00.000Z', grantedBy: 'tenant_admin_1' }
];

const policySet: PolicySet = {
  policySetId: 'policy_1',
  version: '1.0.0',
  scope: 'tenant',
  status: 'active',
  rules: [{ ruleId: 'allow_basic', effect: 'allow', precedenceWeight: 1, conditions: ['role=end_user'], explanationTemplate: 'Allowed.' }]
};

test('admissibility completes before plan compilation and produces compiled plan only when admissible', () => {
  const contract = createExecutionContract({
    contractId: 'contract_10', revision: 1, tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'catalog_launch', objectiveText: 'Use approved action', requestedOutcome: 'action_execution', successCriteria: ['action selected'], urgency: 'normal', domainContext: 'catalog_action', includedEntities: [], excludedEntities: [], allowedDataDomains: ['customer'], excludedDataDomains: [], allowedExternalEffectClass: 'draft_only', requestedActionAssetId: 'action_governed_send', dynamicCompositionRequested: false, classificationCeiling: 'confidential', allowedConnectorIds: ['connector_email'], allowedCredentialScopeIds: ['cred_1'], approvalExpectationMode: 'auto', draftGenerationAllowed: true, applyAllowed: false, sendAllowed: false, outputSensitivityExpectation: 'governed_output_required', desiredOutputForm: 'summary', disclosureAudience: 'initiator', exportRequested: false, sendRequested: false, draftOnly: true, userConstraints: [], systemConstraints: [], policyConstraints: [], classificationConstraints: [], status: 'normalized'
  });
  const authority = computeEffectiveAuthority({ subjectUserId: 'user_1', tenantId: 'tenant_1', environment: 'dev', roleAssignments, visibleAssetIds: ['action_governed_send'], usableAssetIds: ['action_governed_send'], dataDomains: ['customer'] });
  const policyDecision = evaluatePolicy({ policySet, matchedRuleIds: ['allow_basic'] });
  const classification = evaluateClassification({ artifactId: 'classification_1', classification: { level: 'confidential', tags: ['customer'] }, ceiling: 'confidential', mixedAuthority: false });
  const admissibility = evaluateAdmissibility({ contract, effectiveAuthority: authority, policyDecision, classificationEvaluation: classification });
  const selection = selectCapabilities({ contract, assets: [asset], effectiveAuthority: authority });
  const plan = compileExecutionPlan({ contract, admissibilityDecision: admissibility, selection, assets: [asset] });
  assert.equal(admissibility.status, 'admissible');
  assert.equal(selection.blockedReason, undefined);
  assert.equal(plan.status, 'compiled');
  assert.equal(plan.steps.length, 1);
});

test('approval-required admissibility blocks plan compilation', () => {
  const contract = createExecutionContract({
    contractId: 'contract_11', revision: 1, tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'catalog_launch', objectiveText: 'Use approved action with approval', requestedOutcome: 'action_execution', successCriteria: ['action selected'], urgency: 'normal', domainContext: 'catalog_action', includedEntities: [], excludedEntities: [], allowedDataDomains: ['customer'], excludedDataDomains: [], allowedExternalEffectClass: 'draft_only', requestedActionAssetId: 'action_governed_send', dynamicCompositionRequested: false, classificationCeiling: 'confidential', allowedConnectorIds: ['connector_email'], allowedCredentialScopeIds: ['cred_1'], approvalExpectationMode: 'pre-execution', draftGenerationAllowed: true, applyAllowed: false, sendAllowed: false, outputSensitivityExpectation: 'governed_output_required', desiredOutputForm: 'summary', disclosureAudience: 'initiator', exportRequested: false, sendRequested: false, draftOnly: true, userConstraints: [], systemConstraints: [], policyConstraints: [], classificationConstraints: [], status: 'normalized'
  });
  const authority = computeEffectiveAuthority({ subjectUserId: 'user_1', tenantId: 'tenant_1', environment: 'dev', roleAssignments, visibleAssetIds: ['action_governed_send'], usableAssetIds: ['action_governed_send'], dataDomains: ['customer'] });
  const policyDecision = evaluatePolicy({ policySet, matchedRuleIds: ['allow_basic'] });
  const classification = evaluateClassification({ artifactId: 'classification_2', classification: { level: 'confidential', tags: ['customer'] }, ceiling: 'confidential', mixedAuthority: false });
  const admissibility = evaluateAdmissibility({ contract, effectiveAuthority: authority, policyDecision, classificationEvaluation: classification });
  const selection = selectCapabilities({ contract, assets: [asset], effectiveAuthority: authority });
  const plan = compileExecutionPlan({ contract, admissibilityDecision: admissibility, selection, assets: [asset] });
  assert.equal(admissibility.status, 'approval_required');
  assert.equal(plan.status, 'blocked');
});
