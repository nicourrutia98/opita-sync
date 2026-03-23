import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { ActionPolicyService } from './action-policy.service';

@Module({
  imports: [DatabaseModule],
  providers: [ActionPolicyService],
  exports: [ActionPolicyService],
})
export class ActionPolicyModule {}
