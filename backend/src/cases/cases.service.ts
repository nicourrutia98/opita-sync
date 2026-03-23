import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CaseStatus } from '@prisma/client';
import { toJson } from '../common/database/prisma-json.util';
import { PrismaService } from '../common/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async nextCaseCode(tenantId: string) {
    const count = await this.prisma.case.count({ where: { tenantId } });
    return `CASE-${String(count + 1).padStart(6, '0')}`;
  }

  async createCase(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    caseType: string,
    priorityCode: string,
    requesterUserId: string,
    createdFromConversationId?: string,
    initialContextJson?: Record<string, unknown>,
  ) {
    const caseCode = await this.nextCaseCode(tenantId);
    const createdCase = await this.prisma.case.create({
      data: {
        tenantId,
        caseCode,
        caseType,
        statusCode: CaseStatus.OPEN,
        priorityCode,
        requesterUserId,
        createdFromConversationId: createdFromConversationId ?? null,
      },
    });

    if (initialContextJson) {
      await this.prisma.caseContext.create({
        data: {
          tenantId,
          caseId: createdCase.id,
          contextType: 'initial',
          contextKey: 'request',
          contextValueJson: toJson(initialContextJson),
        },
      });
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorRoleCode,
      caseId: createdCase.id,
      eventCode: 'case.create',
      entityType: 'case',
      entityId: createdCase.id,
      resultCode: 'success',
      afterStateJson: {
        caseCode,
        statusCode: CaseStatus.OPEN,
      },
    });

    return createdCase;
  }

  async getCase(tenantId: string, caseId: string) {
    const record = await this.prisma.case.findFirst({
      where: { tenantId, id: caseId },
      include: {
        contexts: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    if (!record) {
      throw new NotFoundException('Case not found');
    }
    return record;
  }

  async listVisibleCases(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
  ) {
    if (actorRoleCode === 'TENANT_ADMIN' || actorRoleCode === 'SUPERVISOR') {
      return this.prisma.case.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    }

    if (actorRoleCode === 'TECHNICIAN') {
      return this.prisma.case.findMany({
        where: {
          tenantId,
          OR: [{ ownerUserId: actorUserId }, { requesterUserId: actorUserId }],
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    }

    return this.prisma.case.findMany({
      where: {
        tenantId,
        requesterUserId: actorUserId,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  async findByOriginConversation(tenantId: string, conversationId: string) {
    return this.prisma.case.findFirst({
      where: {
        tenantId,
        createdFromConversationId: conversationId,
      },
    });
  }

  async getVisibleCaseForActor(
    tenantId: string,
    caseId: string,
    actorUserId: string,
    actorRoleCode: string,
  ) {
    const record = await this.getCase(tenantId, caseId);

    if (actorRoleCode === 'TENANT_ADMIN' || actorRoleCode === 'SUPERVISOR') {
      return record;
    }

    if (actorRoleCode === 'TECHNICIAN') {
      if (record.ownerUserId === actorUserId || record.requesterUserId === actorUserId) {
        return record;
      }
      throw new ForbiddenException('Case is not visible for the current technician');
    }

    if (record.requesterUserId === actorUserId) {
      return record;
    }

    throw new ForbiddenException('Case is not visible for the current user');
  }

  async updateCase(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    caseId: string,
    updates: {
      statusCode?: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
      ownerUserId?: string;
    },
  ) {
    const current = await this.getCase(tenantId, caseId);
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        statusCode: (updates.statusCode as CaseStatus | undefined) ?? current.statusCode,
        ownerUserId:
          Object.prototype.hasOwnProperty.call(updates, 'ownerUserId')
            ? updates.ownerUserId ?? null
            : current.ownerUserId,
      },
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorRoleCode,
      caseId,
      eventCode: 'case.update',
      entityType: 'case',
      entityId: caseId,
      resultCode: 'success',
      beforeStateJson: {
        statusCode: current.statusCode,
        ownerUserId: current.ownerUserId,
      },
      afterStateJson: {
        statusCode: updated.statusCode,
        ownerUserId: updated.ownerUserId,
      },
    });

    return updated;
  }
}
