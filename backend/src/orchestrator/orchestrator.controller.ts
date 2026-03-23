import { Body, Controller, Post } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { ConfirmConfirmationRequestDto } from '../confirmation-requests/dto/confirm-confirmation-request.dto';
import { ExecuteOrchestratorDto } from './dto/execute-orchestrator.dto';
import { OrchestratorService } from './orchestrator.service';
import { Param } from '@nestjs/common';

@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post('execute')
  @Permissions('conversation.read', 'case.read')
  execute(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: ExecuteOrchestratorDto,
  ) {
    return this.orchestratorService.execute(session, dto);
  }

  @Post('confirm/:id')
  @Permissions('tool.confirm_execution')
  confirm(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') confirmationId: string,
    @Body() dto: ConfirmConfirmationRequestDto,
  ) {
    return this.orchestratorService.confirmAndExecute(
      session,
      confirmationId,
      dto.confirmationCode,
    );
  }
}
