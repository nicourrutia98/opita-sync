import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { CreateToolRegistryEntryDto } from './dto/create-tool-registry-entry.dto';
import { UpdateToolRegistryEntryDto } from './dto/update-tool-registry-entry.dto';
import { ToolRegistryService } from './tool-registry.service';

@Controller('tools')
export class ToolRegistryController {
  constructor(private readonly toolRegistryService: ToolRegistryService) {}

  @Get()
  @Permissions('tool.read_registry')
  list(
    @CurrentSession() session: SessionPrincipal,
    @Query('capabilityCode') capabilityCode?: string,
  ) {
    return this.toolRegistryService.listByTenant(session.tenantId, capabilityCode);
  }

  @Post()
  @Permissions('tool.manage_registry')
  create(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: CreateToolRegistryEntryDto,
  ) {
    return this.toolRegistryService.createManaged(
      session.tenantId,
      session.userId,
      session.role,
      {
        tenantId: session.tenantId,
        ...dto,
      },
    );
  }

  @Patch(':id')
  @Permissions('tool.manage_registry')
  patch(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') toolId: string,
    @Body() dto: UpdateToolRegistryEntryDto,
  ) {
    return this.toolRegistryService.patchManaged(
      session.tenantId,
      session.userId,
      session.role,
      toolId,
      dto,
    );
  }

  @Post(':id/review')
  @Permissions('tool.review')
  review(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') toolId: string,
  ) {
    return this.toolRegistryService.transitionStatus(
      session.tenantId,
      session.userId,
      session.role,
      toolId,
      'REVIEWED',
    );
  }

  @Post(':id/certify')
  @Permissions('tool.certify')
  certify(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') toolId: string,
  ) {
    return this.toolRegistryService.transitionStatus(
      session.tenantId,
      session.userId,
      session.role,
      toolId,
      'CERTIFIED',
    );
  }

  @Post(':id/promote')
  @Permissions('tool.promote')
  promote(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') toolId: string,
  ) {
    return this.toolRegistryService.transitionStatus(
      session.tenantId,
      session.userId,
      session.role,
      toolId,
      'PRODUCTION',
    );
  }

  @Post(':id/deprecate')
  @Permissions('tool.deprecate')
  deprecate(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') toolId: string,
  ) {
    return this.toolRegistryService.transitionStatus(
      session.tenantId,
      session.userId,
      session.role,
      toolId,
      'DEPRECATED',
    );
  }
}
