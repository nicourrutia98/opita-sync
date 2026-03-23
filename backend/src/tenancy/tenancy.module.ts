import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { TenancyController } from './tenancy.controller';
import { TenancyService } from './tenancy.service';

@Module({
  imports: [IdentityAccessModule, AuditModule],
  controllers: [TenancyController],
  providers: [TenancyService],
  exports: [TenancyService],
})
export class TenancyModule {}
