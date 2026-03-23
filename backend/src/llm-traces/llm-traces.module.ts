import { Module } from '@nestjs/common';
import { LlmTracesController } from './llm-traces.controller';
import { LlmTracesService } from './llm-traces.service';

@Module({
  controllers: [LlmTracesController],
  providers: [LlmTracesService],
  exports: [LlmTracesService],
})
export class LlmTracesModule {}
