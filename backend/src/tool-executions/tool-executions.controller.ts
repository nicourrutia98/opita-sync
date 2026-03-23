import { Controller, Get, Query } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { ToolExecutionsService } from './tool-executions.service';

@Controller('tool-executions')
export class ToolExecutionsController {
  constructor(private readonly toolExecutionsService: ToolExecutionsService) {}

  @Get()
  @Permissions('tool.read_execution')
  list(
    @CurrentSession() session: SessionPrincipal,
    @Query('limit') limit?: string,
  ) {
    return this.toolExecutionsService.listByTenant(
      session.tenantId,
      Number(limit ?? 50),
    );
  }
}
