import { Module } from '@nestjs/common';
import { ConfirmationRequestsController } from './confirmation-requests.controller';
import { ConfirmationRequestsService } from './confirmation-requests.service';

@Module({
  controllers: [ConfirmationRequestsController],
  providers: [ConfirmationRequestsService],
  exports: [ConfirmationRequestsService],
})
export class ConfirmationRequestsModule {}
