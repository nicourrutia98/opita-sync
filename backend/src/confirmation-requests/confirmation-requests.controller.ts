import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { ConfirmConfirmationRequestDto } from './dto/confirm-confirmation-request.dto';
import { ConfirmationRequestsService } from './confirmation-requests.service';

@Controller('confirmation-requests')
export class ConfirmationRequestsController {
  constructor(
    private readonly confirmationRequestsService: ConfirmationRequestsService,
  ) {}

  @Get()
  @Permissions('tool.read_execution')
  list(
    @CurrentSession() session: SessionPrincipal,
    @Query('limit') limit?: string,
  ) {
    return this.confirmationRequestsService.listByTenant(
      session.tenantId,
      Number(limit ?? 50),
    );
  }

  @Post(':id/confirm')
  @Permissions('tool.confirm_execution')
  confirm(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') confirmationId: string,
    @Body() dto: ConfirmConfirmationRequestDto,
  ) {
    return this.confirmationRequestsService.confirm(
      session.tenantId,
      confirmationId,
      session.userId,
      session.role,
      dto.confirmationCode,
    );
  }

  @Post(':id/reject')
  @Permissions('tool.confirm_execution')
  reject(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') confirmationId: string,
  ) {
    return this.confirmationRequestsService.reject(
      session.tenantId,
      confirmationId,
      session.userId,
      session.role,
    );
  }
}
