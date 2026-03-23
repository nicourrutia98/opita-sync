import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import appConfig from './common/config/app.config';
import { validateEnv } from './common/config/env.validation';
import { DatabaseModule } from './common/database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { SystemModule } from './system/system.module';
import { AuditModule } from './audit/audit.module';
import { LlmTracesModule } from './llm-traces/llm-traces.module';
import { IdentityAccessModule } from './identity-access/identity-access.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { TenantSettingsModule } from './tenant-settings/tenant-settings.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ConversationSummaryModule } from './conversation-summary/conversation-summary.module';
import { CasesModule } from './cases/cases.module';
import { ContextBuilderModule } from './context-builder/context-builder.module';
import { ToolRegistryModule } from './tool-registry/tool-registry.module';
import { ActionPolicyModule } from './action-policy/action-policy.module';
import { ToolExecutionsModule } from './tool-executions/tool-executions.module';
import { PositiveActionsModule } from './positive-actions/positive-actions.module';
import { ConfirmationRequestsModule } from './confirmation-requests/confirmation-requests.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnv,
    }),
    JwtModule.register({}),
    DatabaseModule,
    SystemModule,
    AuditModule,
    LlmTracesModule,
    IdentityAccessModule,
    TenancyModule,
    TenantSettingsModule,
    AuthModule,
    ConversationsModule,
    ConversationSummaryModule,
    CasesModule,
    ContextBuilderModule,
    ToolRegistryModule,
    ActionPolicyModule,
    ToolExecutionsModule,
    PositiveActionsModule,
    ConfirmationRequestsModule,
    OrchestratorModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      inject: [Reflector, JwtService, ConfigService],
      useFactory: (
        reflector: Reflector,
        jwtService: JwtService,
        configService: ConfigService,
      ) => new JwtAuthGuard(reflector, jwtService, configService),
    },
    {
      provide: APP_GUARD,
      inject: [Reflector],
      useFactory: (reflector: Reflector) => new PermissionsGuard(reflector),
    },
  ],
})
export class AppModule {}
