import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditModule } from '../audit/audit.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseIdentityService } from './firebase-identity.service';
import { InternalSessionService } from './internal-session.service';

@Module({
  imports: [JwtModule.register({}), TenancyModule, IdentityAccessModule, AuditModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseIdentityService, InternalSessionService],
  exports: [InternalSessionService],
})
export class AuthModule {}
