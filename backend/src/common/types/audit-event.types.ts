export interface AuditEventInput {
  tenantId: string;
  actorUserId?: string | null;
  actorRoleCode?: string | null;
  conversationId?: string | null;
  caseId?: string | null;
  capabilityCode?: string | null;
  eventCode: string;
  entityType: string;
  entityId: string;
  beforeStateJson?: Record<string, unknown> | null;
  afterStateJson?: Record<string, unknown> | null;
  resultCode: string;
}
