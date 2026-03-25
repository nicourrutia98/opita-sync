import type { Environment, RoleAssignment, SystemIdentity, Tenant, User } from '../../domain/src/index.js';

export interface IdentitySnapshot {
  tenant: Tenant;
  users: User[];
  roleAssignments: RoleAssignment[];
  systemIdentities: SystemIdentity[];
}

export function createTenant(input: { tenantId: string; name: string; enabledEnvironments: Environment[]; active?: boolean }): Tenant {
  return {
    tenantId: input.tenantId,
    name: input.name,
    enabledEnvironments: [...new Set(input.enabledEnvironments)],
    active: input.active ?? true
  };
}

export function createUser(input: { userId: string; tenantId: string; email: string; displayName: string; active?: boolean }): User {
  return {
    userId: input.userId,
    tenantId: input.tenantId,
    email: input.email,
    displayName: input.displayName,
    active: input.active ?? true
  };
}

export function createSystemIdentity(input: {
  systemIdentityId: string;
  tenantId: string;
  environment: Environment;
  ownerUserId: string;
  scopeDescription: string;
  active?: boolean;
}): SystemIdentity {
  return {
    ...input,
    active: input.active ?? true
  };
}
