import { Controller, Get, Query } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { PositiveActionsService } from './positive-actions.service';

@Controller('positive-actions')
export class PositiveActionsController {
  constructor(private readonly positiveActionsService: PositiveActionsService) {}

  @Get()
  @Permissions('positive_action.read')
  list(
    @CurrentSession() session: SessionPrincipal,
    @Query('limit') limit?: string,
  ) {
    return this.positiveActionsService.listByTenant(
      session.tenantId,
      Number(limit ?? 50),
    );
  }
}
