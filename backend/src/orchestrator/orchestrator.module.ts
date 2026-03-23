import { Module } from '@nestjs/common';
import { ActionPolicyModule } from '../action-policy/action-policy.module';
import { AuditModule } from '../audit/audit.module';
import { CasesModule } from '../cases/cases.module';
import { ConfirmationRequestsModule } from '../confirmation-requests/confirmation-requests.module';
import { ContextBuilderModule } from '../context-builder/context-builder.module';
import { PositiveActionsModule } from '../positive-actions/positive-actions.module';
import { ToolExecutionsModule } from '../tool-executions/tool-executions.module';
import { ToolRegistryModule } from '../tool-registry/tool-registry.module';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [
    ToolRegistryModule,
    ActionPolicyModule,
    ToolExecutionsModule,
    PositiveActionsModule,
    ConfirmationRequestsModule,
    AuditModule,
    ContextBuilderModule,
    CasesModule,
  ],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
