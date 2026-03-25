import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContractFromNormalizedIntent, normalizeIntent } from '../../packages/application/src/index.js';

test('raw intent normalizes into explicit contract artifact', () => {
  const normalized = normalizeIntent({
    tenantId: 'tenant_1',
    environment: 'dev',
    initiatorUserId: 'user_1',
    authorityContextId: 'auth_ctx_1',
    sourceType: 'chat',
    rawIntent: ' Draft a governed customer follow-up message '
  });

  const contract = buildContractFromNormalizedIntent({
    tenantId: 'tenant_1',
    environment: 'dev',
    initiatorUserId: 'user_1',
    authorityContextId: 'auth_ctx_1',
    sourceType: 'chat',
    rawIntent: ' Draft a governed customer follow-up message ',
    contractId: 'contract_2',
    revision: 1,
    normalized
  });

  assert.equal(contract.objectiveText, 'Draft a governed customer follow-up message');
  assert.equal(contract.status, 'normalized');
  assert.equal(contract.dynamicCompositionRequested, false);
  assert.equal(contract.applyAllowed, false);
  assert.equal(contract.sendAllowed, false);
});

test('catalog launch produces contract with explicit requested asset', () => {
  const normalized = normalizeIntent({
    tenantId: 'tenant_1',
    environment: 'dev',
    initiatorUserId: 'user_1',
    authorityContextId: 'auth_ctx_1',
    sourceType: 'catalog_launch',
    rawIntent: 'Use approved workflow',
    requestedWorkflowAssetId: 'workflow_1'
  });

  const contract = buildContractFromNormalizedIntent({
    tenantId: 'tenant_1',
    environment: 'dev',
    initiatorUserId: 'user_1',
    authorityContextId: 'auth_ctx_1',
    sourceType: 'catalog_launch',
    rawIntent: 'Use approved workflow',
    requestedWorkflowAssetId: 'workflow_1',
    contractId: 'contract_3',
    revision: 1,
    normalized
  });

  assert.equal(contract.requestedWorkflowAssetId, 'workflow_1');
  assert.equal(contract.requestedOutcome, 'workflow_execution');
  assert.equal(contract.sourceType, 'catalog_launch');
});
