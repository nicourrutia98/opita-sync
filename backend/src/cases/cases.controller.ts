import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @Permissions('case.read')
  listCases(@CurrentSession() session: SessionPrincipal) {
    return this.casesService.listVisibleCases(
      session.tenantId,
      session.userId,
      session.role,
    );
  }

  @Get(':id')
  @Permissions('case.read')
  getCase(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') caseId: string,
  ) {
    return this.casesService.getCase(session.tenantId, caseId);
  }

  @Post()
  @Permissions('case.create')
  createCase(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: CreateCaseDto,
  ) {
    return this.casesService.createCase(
      session.tenantId,
      session.userId,
      session.role,
      dto.caseType,
      dto.priorityCode,
      dto.requesterUserId ?? session.userId,
      dto.createdFromConversationId,
      dto.initialContextJson,
    );
  }

  @Patch(':id')
  @Permissions('case.update')
  updateCase(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') caseId: string,
    @Body() dto: UpdateCaseDto,
  ) {
    return this.casesService.updateCase(session.tenantId, session.userId, session.role, caseId, dto);
  }
}
