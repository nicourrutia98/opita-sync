import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TenancyService } from './tenancy.service';

@Controller('tenants/current')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Get()
  getCurrentTenant(@CurrentSession() session: SessionPrincipal) {
    return this.tenancyService.getTenantById(session.tenantId);
  }

  @Get('members')
  @Permissions('tenant.manage_members')
  listMembers(@CurrentSession() session: SessionPrincipal) {
    return this.tenancyService.listCurrentMembers(session.tenantId);
  }

  @Post('members/invite')
  @Permissions('tenant.manage_members')
  inviteMember(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: InviteMemberDto,
  ) {
    return this.tenancyService.inviteMember(
      session.tenantId,
      session.userId,
      dto.email,
      dto.roleCode,
    );
  }
}
