import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ConversationSummaryModule } from '../conversation-summary/conversation-summary.module';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [AuditModule, ConversationSummaryModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
