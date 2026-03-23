import { Module } from '@nestjs/common';
import { ConversationSummaryService } from './conversation-summary.service';

@Module({
  providers: [ConversationSummaryService],
  exports: [ConversationSummaryService],
})
export class ConversationSummaryModule {}
