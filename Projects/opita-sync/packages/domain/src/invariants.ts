import type { ClassificationLevel, ClassificationMark, Environment, SystemIdentity, Tenant } from './models.js';

const CLASSIFICATION_ORDER: Record<ClassificationLevel, number> = {
  internal: 0,
  confidential: 1,
  restricted: 2,
  high_impact: 3
};

export function ensureTenantHasEnvironment(tenant: Tenant, environment: Environment): void {
  if (!tenant.enabledEnvironments.includes(environment)) {
    throw new Error(`Tenant ${tenant.tenantId} is not enabled for environment ${environment}`);
  }
}

export function ensureSystemIdentityHasOwner(identity: SystemIdentity): void {
  if (!identity.ownerUserId.trim()) {
    throw new Error(`System identity ${identity.systemIdentityId} must have a human owner`);
  }
}

export function compareClassificationSeverity(left: ClassificationMark, right: ClassificationMark): number {
  return CLASSIFICATION_ORDER[left.level] - CLASSIFICATION_ORDER[right.level];
}

export function exceedsClassificationCeiling(mark: ClassificationMark, ceiling: ClassificationLevel): boolean {
  return CLASSIFICATION_ORDER[mark.level] > CLASSIFICATION_ORDER[ceiling];
}
