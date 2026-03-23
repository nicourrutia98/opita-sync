import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { toNullableJson } from '../common/database/prisma-json.util';
import type { ToolExecutionAttemptInput } from '../common/types/tool-execution.types';

@Injectable()
export class ToolExecutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordAttempt(input: ToolExecutionAttemptInput) {
    return (this.prisma as any).toolExecutionAttempt.create({
      data: {
        tenantId: input.tenantId,
        conversationId: input.conversationId ?? null,
        caseId: input.caseId ?? null,
        actorUserId: input.actorUserId ?? null,
        intentCode: input.intentCode ?? null,
        capabilityCode: input.capabilityCode,
        toolCode: input.toolCode,
        toolVersion: input.toolVersion,
        executionMode: input.executionMode as never,
        confirmationRequired: input.confirmationRequired ?? false,
        confirmationStatus: (input.confirmationStatus ?? 'NOT_REQUIRED') as never,
        executionResult: input.executionResult as never,
        requestPayloadJson: toNullableJson(input.requestPayloadJson),
        responsePayloadJson: toNullableJson(input.responsePayloadJson),
      },
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return (this.prisma as any).toolExecutionAttempt.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
