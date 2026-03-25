import assert from 'node:assert/strict';
import test from 'node:test';

import { computeEffectiveAuthority, assertDelegationIsActive, type DelegationGrant } from '../../packages/authority/src/index.js';
import type { RoleAssignment } from '../../packages/domain/src/index.js';

const baseAssignments: RoleAssignment[] = [
  {
    tenantId: 'tenant_1',
    userId: 'user_admin',
    roleId: 'tenant_admin',
    grantedAt: '2026-01-01T00:00:00.000Z',
    grantedBy: 'superadmin_1'
  },
  {
    tenantId: 'tenant_1',
    userId: 'user_end',
    roleId: 'end_user',
    grantedAt: '2026-01-01T00:00:00.000Z',
    grantedBy: 'tenant_admin_1'
  }
];

test('effective authority preserves separate permission dimensions', () => {
  const authority = computeEffectiveAuthority({
    subjectUserId: 'user_end',
    tenantId: 'tenant_1',
    environment: 'dev',
    roleAssignments: baseAssignments,
    visibleAssetIds: ['asset_visible'],
    usableAssetIds: ['asset_usable'],
    dataDomains: ['customer']
  });

  assert.deepEqual(authority.canViewAssets, ['asset_visible']);
  assert.deepEqual(authority.canUseAssets, ['asset_usable']);
  assert.deepEqual(authority.canAccessDataDomains, ['customer']);
  assert.equal(authority.canGenerateDraft, true);
  assert.equal(authority.canApply, false);
  assert.equal(authority.canSend, false);
  assert.equal(authority.canApprove, false);
  assert.equal(authority.canDelegate, false);
});

test('delegation must be active and not expired', () => {
  const activeGrant: DelegationGrant = {
    delegationId: 'deleg_1',
    fromUserId: 'manager_1',
    toUserId: 'delegate_1',
    tenantId: 'tenant_1',
    status: 'active',
    scope: {
      allowedActionAssetIds: ['asset_1'],
      allowedWorkflowAssetIds: [],
      allowedBusinessAreas: ['finance'],
      allowedSystems: ['crm'],
      allowedDataDomains: ['customer'],
      approvalRights: ['approve_low_risk']
    },
    grantedAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2027-01-01T00:00:00.000Z',
    grantedBy: 'tenant_admin_1'
  };
  assert.doesNotThrow(() => assertDelegationIsActive(activeGrant, '2026-02-01T00:00:00.000Z'));
  assert.throws(() => assertDelegationIsActive({ ...activeGrant, status: 'revoked' }, '2026-02-01T00:00:00.000Z'), /not active/);
  assert.throws(() => assertDelegationIsActive({ ...activeGrant, expiresAt: '2026-01-15T00:00:00.000Z' }, '2026-02-01T00:00:00.000Z'), /expired/);
});
