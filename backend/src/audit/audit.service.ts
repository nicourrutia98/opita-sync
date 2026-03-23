import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { toNullableJson } from '../common/database/prisma-json.util';
import type { AuditEventInput } from '../common/types/audit-event.types';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditEventInput) {
    return this.prisma.auditEvent.create({
      data: {
        tenantId: input.tenantId,
        actorUserId: input.actorUserId ?? null,
        actorRoleCode: input.actorRoleCode as never,
        conversationId: input.conversationId ?? null,
        caseId: input.caseId ?? null,
        capabilityCode: input.capabilityCode ?? null,
        eventCode: input.eventCode,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeStateJson: toNullableJson(input.beforeStateJson),
        afterStateJson: toNullableJson(input.afterStateJson),
        resultCode: input.resultCode,
      },
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return this.prisma.auditEvent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
