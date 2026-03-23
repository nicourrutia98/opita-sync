import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationStatus, SenderType } from '@prisma/client';
import { toNullableJson } from '../common/database/prisma-json.util';
import { PrismaService } from '../common/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConversationSummaryService } from '../conversation-summary/conversation-summary.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly conversationSummaryService: ConversationSummaryService,
  ) {}

  async createConversation(tenantId: string, userId: string, roleCode: string, title?: string, activeCaseId?: string) {
    const conversation = await this.prisma.conversation.create({
      data: {
        tenantId,
        userId,
        roleCode: roleCode as never,
        title: title ?? null,
        activeCaseId: activeCaseId ?? null,
        status: ConversationStatus.ACTIVE,
      },
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorRoleCode: roleCode,
      conversationId: conversation.id,
      eventCode: 'conversation.create',
      entityType: 'conversation',
      entityId: conversation.id,
      resultCode: 'success',
    });

    return conversation;
  }

  async listConversations(tenantId: string, userId: string) {
    return this.prisma.conversation.findMany({
      where: { tenantId, userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  async getConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async listMessages(tenantId: string, conversationId: string) {
    await this.getConversation(tenantId, conversationId);
    return this.prisma.conversationMessage.findMany({
      where: { tenantId, conversationId },
      orderBy: { messageIndex: 'asc' },
    });
  }

  async appendMessage(
    tenantId: string,
    userId: string,
    roleCode: string,
    conversationId: string,
    senderType: 'USER' | 'ASSISTANT' | 'SYSTEM',
    contentText: string,
    senderRef?: string,
    contentStructuredJson?: Record<string, unknown>,
    isSensitive?: boolean,
  ) {
    const conversation = await this.getConversation(tenantId, conversationId);
    if (conversation.status !== ConversationStatus.ACTIVE) {
      throw new ForbiddenException('Conversation is not active');
    }

    const nextIndex =
      (await this.prisma.conversationMessage.count({
        where: { conversationId },
      })) + 1;

    const message = await this.prisma.conversationMessage.create({
      data: {
        tenantId,
        conversationId,
        messageIndex: nextIndex,
        senderType: senderType as SenderType,
        senderRef: senderRef ?? null,
        contentText,
        contentStructuredJson: toNullableJson(contentStructuredJson),
        isSensitive: isSensitive ?? false,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorRoleCode: roleCode,
      conversationId,
      caseId: conversation.activeCaseId,
      eventCode: 'conversation.message.append',
      entityType: 'conversation_message',
      entityId: message.id,
      resultCode: 'success',
      afterStateJson: {
        senderType,
        messageIndex: nextIndex,
      },
    });

    return message;
  }

  async rebuildSummary(tenantId: string, conversationId: string) {
    return this.conversationSummaryService.rebuildSummary(tenantId, conversationId);
  }
}
