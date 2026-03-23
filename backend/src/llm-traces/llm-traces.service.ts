import { Injectable } from '@nestjs/common';
import { toNullableJson } from '../common/database/prisma-json.util';
import { PrismaService } from '../common/database/prisma.service';
import type { LlmTraceInput } from '../common/types/llm-trace.types';

@Injectable()
export class LlmTracesService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: LlmTraceInput) {
    return this.prisma.llmTrace.create({
      data: {
        tenantId: input.tenantId,
        conversationId: input.conversationId ?? null,
        caseId: input.caseId ?? null,
        capabilityCode: input.capabilityCode ?? null,
        providerName: input.providerName,
        modelName: input.modelName,
        requestContractJson: toNullableJson(input.requestContractJson),
        responseContractJson: toNullableJson(input.responseContractJson),
        tokenInputCount: input.tokenInputCount ?? null,
        tokenOutputCount: input.tokenOutputCount ?? null,
        latencyMs: input.latencyMs ?? null,
        resultCode: input.resultCode,
      },
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return this.prisma.llmTrace.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
