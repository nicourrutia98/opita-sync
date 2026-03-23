import { Module } from '@nestjs/common';
import { IdentityAccessService } from './identity-access.service';

@Module({
  providers: [IdentityAccessService],
  exports: [IdentityAccessService],
})
export class IdentityAccessModule {}
