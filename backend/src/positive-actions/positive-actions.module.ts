import { Module } from '@nestjs/common';
import { PositiveActionsController } from './positive-actions.controller';
import { PositiveActionsService } from './positive-actions.service';

@Module({
  controllers: [PositiveActionsController],
  providers: [PositiveActionsService],
  exports: [PositiveActionsService],
})
export class PositiveActionsModule {}
