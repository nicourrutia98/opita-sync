import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import type { PositiveActionInput } from '../common/types/tool-execution.types';

@Injectable()
export class PositiveActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: PositiveActionInput) {
    return (this.prisma as any).positiveAction.create({
      data: {
        tenantId: input.tenantId,
        conversationId: input.conversationId ?? null,
        caseId: input.caseId ?? null,
        actorUserId: input.actorUserId ?? null,
        capabilityCode: input.capabilityCode,
        toolCode: input.toolCode,
        toolVersion: input.toolVersion,
        executionAttemptId: input.executionAttemptId,
        auditEventId: input.auditEventId ?? null,
        providerTraceId: input.providerTraceId ?? null,
      },
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return (this.prisma as any).positiveAction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
