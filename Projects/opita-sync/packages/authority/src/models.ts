import type { Environment, RoleAssignment } from '../../domain/src/index.js';

export type PermissionDimension =
  | 'view_asset'
  | 'use_asset'
  | 'access_data'
  | 'generate_draft'
  | 'apply'
  | 'send'
  | 'approve'
  | 'delegate';

export interface DelegationScope {
  allowedActionAssetIds: string[];
  allowedWorkflowAssetIds: string[];
  allowedBusinessAreas: string[];
  allowedSystems: string[];
  allowedDataDomains: string[];
  approvalRights: string[];
  timeWindow?: { startsAt: string; endsAt: string };
}

export interface DelegationGrant {
  delegationId: string;
  fromUserId: string;
  toUserId: string;
  tenantId: string;
  status: 'active' | 'revoked' | 'expired';
  scope: DelegationScope;
  grantedAt: string;
  expiresAt?: string;
  grantedBy: string;
}

export interface EffectiveAuthorityArtifact {
  subjectUserId: string;
  actingAsUserId?: string;
  tenantId: string;
  environment: Environment;
  canViewAssets: string[];
  canUseAssets: string[];
  canAccessDataDomains: string[];
  canGenerateDraft: boolean;
  canApply: boolean;
  canSend: boolean;
  canApprove: boolean;
  canDelegate: boolean;
  supportingRelationshipRefs: string[];
  computedAt: string;
}

export const ROLE_PERMISSION_MAP: Record<RoleAssignment['roleId'], PermissionDimension[]> = {
  superadmin: ['view_asset', 'use_asset', 'access_data', 'generate_draft', 'apply', 'send', 'approve', 'delegate'],
  tenant_admin: ['view_asset', 'use_asset', 'access_data', 'generate_draft', 'apply', 'send', 'approve', 'delegate'],
  subadmin: ['view_asset', 'use_asset', 'access_data', 'generate_draft', 'approve'],
  end_user: ['view_asset', 'use_asset', 'access_data', 'generate_draft'],
  approver: ['view_asset', 'approve']
};
