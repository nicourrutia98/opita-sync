export type Environment = 'dev' | 'staging' | 'prod';
export type RoleId = 'superadmin' | 'tenant_admin' | 'subadmin' | 'end_user' | 'approver';

export interface Tenant {
  tenantId: string;
  name: string;
  enabledEnvironments: Environment[];
  active: boolean;
}

export interface User {
  userId: string;
  tenantId: string;
  email: string;
  displayName: string;
  active: boolean;
}

export interface RoleAssignment {
  tenantId: string;
  userId: string;
  roleId: RoleId;
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

export interface SystemIdentity {
  systemIdentityId: string;
  tenantId: string;
  environment: Environment;
  ownerUserId: string;
  scopeDescription: string;
  active: boolean;
}

export type PolicyOutcome = 'deny' | 'allow' | 'allow_with_restrictions' | 'require_approval' | 'require_redaction_path';

export type ClassificationLevel = 'internal' | 'confidential' | 'restricted' | 'high_impact';
export type ClassificationTag = 'pii' | 'hr' | 'legal' | 'finance' | 'customer' | 'regulated' | 'export_controlled';

export interface ClassificationMark {
  level: ClassificationLevel;
  tags: ClassificationTag[];
}

export interface AuditEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  tenantId: string;
  actorId: string;
  payload: Readonly<TPayload>;
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
