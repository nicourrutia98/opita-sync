import { Controller, Get, Query } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { LlmTracesService } from './llm-traces.service';

@Controller('llm-traces')
export class LlmTracesController {
  constructor(private readonly llmTracesService: LlmTracesService) {}

  @Get()
  @Permissions('trace.read')
  list(
    @CurrentSession() session: SessionPrincipal,
    @Query() query: PaginationQueryDto,
  ) {
    return this.llmTracesService.listByTenant(session.tenantId, query.limit);
  }
}
