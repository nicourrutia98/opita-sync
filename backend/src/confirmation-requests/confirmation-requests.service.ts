import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { toJsonValue } from '../common/database/prisma-json.util';
import { PrismaService } from '../common/database/prisma.service';
import type { ConfirmationRequestInput } from '../common/types/tool-execution.types';

@Injectable()
export class ConfirmationRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private async markExpiredIfNeeded(record: any) {
    if (!record) {
      return null;
    }

    if (record.status === 'PENDING' && new Date(record.expiresAt).getTime() <= Date.now()) {
      return (this.prisma as any).confirmationRequest.update({
        where: { id: record.id },
        data: { status: 'EXPIRED' },
      });
    }

    return record;
  }

  async create(input: ConfirmationRequestInput) {
    return (this.prisma as any).confirmationRequest.create({
      data: {
        tenantId: input.tenantId,
        conversationId: input.conversationId ?? null,
        caseId: input.caseId ?? null,
        actorUserId: input.actorUserId,
        capabilityCode: input.capabilityCode,
        toolCode: input.toolCode,
        toolVersion: input.toolVersion,
        confirmationCode: input.confirmationCode,
        requestedPayloadJson: toJsonValue(input.requestedPayloadJson),
        expiresAt: input.expiresAt,
      },
    });
  }

  async createForExecution(input: Omit<ConfirmationRequestInput, 'confirmationCode'>) {
    const confirmationCode = randomBytes(6).toString('hex');
    return this.create({
      ...input,
      confirmationCode,
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    const records = await (this.prisma as any).confirmationRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return Promise.all(records.map((record: any) => this.markExpiredIfNeeded(record)));
  }

  async getById(tenantId: string, confirmationId: string) {
    const record = await (this.prisma as any).confirmationRequest.findFirst({
      where: {
        tenantId,
        id: confirmationId,
      },
    });
    if (!record) {
      throw new NotFoundException('Confirmation request not found');
    }
    return this.markExpiredIfNeeded(record);
  }

  async assertPendingForExecution(
    tenantId: string,
    confirmationId: string,
    requesterUserId: string,
    role: string,
    confirmationCode?: string,
  ) {
    const record = await this.getById(tenantId, confirmationId);
    if (!record) {
      throw new NotFoundException('Confirmation request not found');
    }
    if (record.status === 'EXPIRED') {
      throw new ForbiddenException('Confirmation request expired');
    }
    if (record.status !== 'PENDING') {
      throw new ForbiddenException('Confirmation request is not pending');
    }
    if (
      role !== 'TENANT_ADMIN' &&
      role !== 'SUPERVISOR' &&
      record.actorUserId !== requesterUserId
    ) {
      throw new ForbiddenException('Current actor cannot confirm this request');
    }
    if (confirmationCode && record.confirmationCode !== confirmationCode) {
      throw new ForbiddenException('Invalid confirmation code');
    }
    return record;
  }

  async confirm(
    tenantId: string,
    confirmationId: string,
    confirmedByUserId: string,
    role: string,
    confirmationCode?: string,
  ) {
    const record = await this.assertPendingForExecution(
      tenantId,
      confirmationId,
      confirmedByUserId,
      role,
      confirmationCode,
    );

    return (this.prisma as any).confirmationRequest.update({
      where: { id: record.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedByUserId,
      },
    });
  }

  async reject(
    tenantId: string,
    confirmationId: string,
    rejectedByUserId: string,
    role: string,
  ) {
    const record = await this.assertPendingForExecution(
      tenantId,
      confirmationId,
      rejectedByUserId,
      role,
    );

    return (this.prisma as any).confirmationRequest.update({
      where: { id: record.id },
      data: {
        status: 'REJECTED',
        confirmedAt: new Date(),
        confirmedByUserId: rejectedByUserId,
      },
    });
  }
}
