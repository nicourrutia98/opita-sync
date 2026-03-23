import { Controller, Get, Query } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { AuditService } from './audit.service';

@Controller('audit-events')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('audit.read')
  list(
    @CurrentSession() session: SessionPrincipal,
    @Query() query: PaginationQueryDto,
  ) {
    return this.auditService.listByTenant(session.tenantId, query.limit);
  }
}
