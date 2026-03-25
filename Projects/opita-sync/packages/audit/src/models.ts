import type { AuditEvent } from '../../domain/src/index.js';

export type AuditEventType =
  | 'authority.computed'
  | 'policy.decided'
  | 'classification.evaluated'
  | 'runtime.transition'
  | 'approval.transition'
  | 'output.release_decided';

export interface GovernanceAuditPayload {
  summary: string;
  refs?: string[];
}

export function createAuditEvent(input: {
  eventId: string;
  eventType: AuditEventType;
  tenantId: string;
  actorId: string;
  payload: GovernanceAuditPayload;
  occurredAt?: string;
}): AuditEvent<GovernanceAuditPayload> {
  return Object.freeze({
    eventId: input.eventId,
    eventType: input.eventType,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    tenantId: input.tenantId,
    actorId: input.actorId,
    payload: Object.freeze({ ...input.payload, refs: input.payload.refs ? [...input.payload.refs] : undefined })
  });
}
