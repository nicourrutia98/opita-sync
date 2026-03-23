import { Module } from '@nestjs/common';
import { ToolExecutionsController } from './tool-executions.controller';
import { ToolExecutionsService } from './tool-executions.service';

@Module({
  controllers: [ToolExecutionsController],
  providers: [ToolExecutionsService],
  exports: [ToolExecutionsService],
})
export class ToolExecutionsModule {}
