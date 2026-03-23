import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ConversationSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async rebuildSummary(tenantId: string, conversationId: string) {
    const messages = await this.prisma.conversationMessage.findMany({
      where: { tenantId, conversationId },
      orderBy: { messageIndex: 'asc' },
    });

    if (messages.length === 0) {
      throw new NotFoundException('Conversation has no messages to summarize');
    }

    const lastWindow = messages.slice(-10);
    const summaryText = lastWindow
      .map((message) => `[${message.senderType}] ${message.contentText}`)
      .join('\n')
      .slice(0, 4000);

    const summary = await this.prisma.conversationSummary.create({
      data: {
        tenantId,
        conversationId,
        summaryText,
        summaryStructuredJson: {
          algorithm: 'windowed-turn-template-v1',
          messageCount: lastWindow.length,
        },
        sourceMessageFrom: lastWindow[0].messageIndex,
        sourceMessageTo: lastWindow[lastWindow.length - 1].messageIndex,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastSummaryId: summary.id,
      },
    });

    return summary;
  }
}
