import assert from 'node:assert/strict';
import test from 'node:test';

import { compareClassificationSeverity, ensureSystemIdentityHasOwner, ensureTenantHasEnvironment, type ClassificationMark } from '../../packages/domain/src/index.js';
import { createSystemIdentity, createTenant } from '../../packages/identities/src/index.js';

test('tenant environment invariant blocks disabled environment', () => {
  const tenant = createTenant({ tenantId: 'tenant_1', name: 'Tenant One', enabledEnvironments: ['dev', 'staging'] });
  assert.doesNotThrow(() => ensureTenantHasEnvironment(tenant, 'dev'));
  assert.throws(() => ensureTenantHasEnvironment(tenant, 'prod'), /not enabled/);
});

test('system identity invariant requires human owner', () => {
  const valid = createSystemIdentity({
    systemIdentityId: 'sys_1',
    tenantId: 'tenant_1',
    environment: 'dev',
    ownerUserId: 'user_1',
    scopeDescription: 'governed automation'
  });
  assert.doesNotThrow(() => ensureSystemIdentityHasOwner(valid));

  const invalid = { ...valid, ownerUserId: '   ' };
  assert.throws(() => ensureSystemIdentityHasOwner(invalid), /must have a human owner/);
});

test('classification severity ordering is stable', () => {
  const internal: ClassificationMark = { level: 'internal', tags: [] };
  const restricted: ClassificationMark = { level: 'restricted', tags: ['finance'] };
  assert(compareClassificationSeverity(internal, restricted) < 0);
  assert(compareClassificationSeverity(restricted, internal) > 0);
});
