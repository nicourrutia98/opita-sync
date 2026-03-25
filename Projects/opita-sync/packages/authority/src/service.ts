import type { Environment, RoleAssignment } from '../../domain/src/index.js';
import type { DelegationGrant, EffectiveAuthorityArtifact, PermissionDimension } from './models.js';
import { ROLE_PERMISSION_MAP } from './models.js';

function hasPermission(assignments: RoleAssignment[], permission: PermissionDimension): boolean {
  return assignments.some((assignment) => ROLE_PERMISSION_MAP[assignment.roleId].includes(permission));
}

function collectRoleRefs(assignments: RoleAssignment[]): string[] {
  return assignments.map((assignment) => `role:${assignment.roleId}`);
}

function collectDelegationRefs(grants: DelegationGrant[], subjectUserId: string): string[] {
  return grants.filter((grant) => grant.toUserId === subjectUserId && grant.status === 'active').map((grant) => `delegation:${grant.delegationId}`);
}

export function computeEffectiveAuthority(input: {
  subjectUserId: string;
  tenantId: string;
  environment: Environment;
  roleAssignments: RoleAssignment[];
  visibleAssetIds?: string[];
  usableAssetIds?: string[];
  dataDomains?: string[];
  delegationGrants?: DelegationGrant[];
}): EffectiveAuthorityArtifact {
  const roleAssignments = input.roleAssignments.filter((assignment) => assignment.userId === input.subjectUserId && assignment.tenantId === input.tenantId);
  const delegationGrants = input.delegationGrants ?? [];

  return {
    subjectUserId: input.subjectUserId,
    tenantId: input.tenantId,
    environment: input.environment,
    canViewAssets: hasPermission(roleAssignments, 'view_asset') ? [...(input.visibleAssetIds ?? [])] : [],
    canUseAssets: hasPermission(roleAssignments, 'use_asset') ? [...(input.usableAssetIds ?? [])] : [],
    canAccessDataDomains: hasPermission(roleAssignments, 'access_data') ? [...(input.dataDomains ?? [])] : [],
    canGenerateDraft: hasPermission(roleAssignments, 'generate_draft'),
    canApply: hasPermission(roleAssignments, 'apply'),
    canSend: hasPermission(roleAssignments, 'send'),
    canApprove: hasPermission(roleAssignments, 'approve'),
    canDelegate: hasPermission(roleAssignments, 'delegate'),
    supportingRelationshipRefs: [...collectRoleRefs(roleAssignments), ...collectDelegationRefs(delegationGrants, input.subjectUserId)],
    computedAt: new Date().toISOString()
  };
}

export function assertDelegationIsActive(grant: DelegationGrant, asOf: string): void {
  if (grant.status !== 'active') {
    throw new Error(`Delegation ${grant.delegationId} is not active`);
  }
  if (grant.expiresAt && grant.expiresAt < asOf) {
    throw new Error(`Delegation ${grant.delegationId} is expired`);
  }
}
