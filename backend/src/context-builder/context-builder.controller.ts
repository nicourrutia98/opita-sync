import { Body, Controller, Post } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { BuildContextDto } from './dto/build-context.dto';
import { ContextBuilderService } from './context-builder.service';

@Controller('context-builder')
export class ContextBuilderController {
  constructor(private readonly contextBuilderService: ContextBuilderService) {}

  @Post('build')
  build(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: BuildContextDto,
  ) {
    return this.contextBuilderService.build({
      tenantId: session.tenantId,
      userId: session.userId,
      role: session.role,
      conversationId: dto.conversationId,
      intentCode: dto.intentCode,
      capabilityCode: dto.capabilityCode,
      caseId: dto.caseId,
      entityId: dto.entityId,
      toolCode: dto.toolCode,
      toolVersion: dto.toolVersion,
      riskLevel: dto.riskLevel,
      executionMode: dto.executionMode,
      caseType: dto.caseType,
      priorityCode: dto.priorityCode,
      structuredFields: dto.structuredFields,
      currentUserRequest: dto.currentUserRequest,
    });
  }
}
