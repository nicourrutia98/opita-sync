import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAdmissibilityRequestEnvelope,
  createContractRevision,
  createExecutionContract,
  diffExecutionContracts,
  type ExecutionContract
} from '../../packages/contracts/src/index.js';

function baseContract(overrides: Partial<ExecutionContract> = {}): ExecutionContract {
  return createExecutionContract({
    contractId: 'contract_1',
    revision: 1,
    tenantId: 'tenant_1',
    environment: 'dev',
    initiatorUserId: 'user_1',
    authorityContextId: 'auth_ctx_1',
    sourceType: 'chat',
    objectiveText: 'Prepare governed message draft',
    requestedOutcome: 'governed_execution_request',
    successCriteria: ['draft prepared'],
    urgency: 'normal',
    domainContext: 'operate',
    includedEntities: [],
    excludedEntities: [],
    allowedDataDomains: ['customer'],
    excludedDataDomains: [],
    allowedExternalEffectClass: 'draft_only',
    dynamicCompositionRequested: false,
    classificationCeiling: 'confidential',
    allowedConnectorIds: ['connector_email'],
    allowedCredentialScopeIds: ['cred_scope_1'],
    approvalExpectationMode: 'auto',
    draftGenerationAllowed: true,
    applyAllowed: false,
    sendAllowed: false,
    outputSensitivityExpectation: 'governed_output_required',
    desiredOutputForm: 'structured_summary',
    disclosureAudience: 'initiator',
    exportRequested: false,
    sendRequested: false,
    draftOnly: true,
    userConstraints: [],
    systemConstraints: [],
    policyConstraints: [],
    classificationConstraints: [],
    status: 'normalized',
    ...overrides
  });
}

test('contract revision tracks governance-relevant changes', () => {
  const previous = baseContract();
  const next = baseContract({ revision: 2, applyAllowed: true, updatedAt: '2026-03-25T00:00:00.000Z' });
  const revision = createContractRevision({ previous, next, actorId: 'user_1' });

  assert.equal(revision.governanceRelevantChange, true);
  assert.ok(revision.changedFields.includes('revision'));
  assert.ok(revision.changedFields.includes('applyAllowed'));
});

test('contract diff detects no direct execution bypass fields silently', () => {
  const previous = baseContract();
  const next = baseContract({ revision: 2, requestedActionAssetId: 'action_1', updatedAt: '2026-03-25T00:00:00.000Z' });
  const diff = diffExecutionContracts(previous, next);
  assert.ok(diff.includes('requestedActionAssetId'));
});

test('admissibility envelope binds exact contract revision', () => {
  const contract = baseContract({ requestedActionAssetId: 'action_1' });
  const envelope = createAdmissibilityRequestEnvelope(contract, {
    effectiveAuthorityRef: 'authority:user_1',
    policySnapshotRef: 'policy:tenant_1:v1',
    classificationContextRef: 'classification:ctx_1'
  });

  assert.equal(envelope.contractSnapshotRef, 'contract:contract_1:r1');
  assert.deepEqual(envelope.requestedAssetRefs, ['action_1']);
  assert.deepEqual(envelope.requestedConnectorRefs, ['connector_email']);
});
