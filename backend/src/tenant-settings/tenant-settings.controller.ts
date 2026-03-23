import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { UpdateTenantSettingDto } from './dto/update-tenant-setting.dto';
import { UpdateTenantUiBaselineDto } from './dto/update-tenant-ui-baseline.dto';
import { TenantSettingsService } from './tenant-settings.service';

@Controller('tenants/current')
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Get('settings')
  getSettings(@CurrentSession() session: SessionPrincipal) {
    return this.tenantSettingsService.listForTenant(session.tenantId);
  }

  @Get('ui-baseline')
  getUiBaseline(@CurrentSession() session: SessionPrincipal) {
    return this.tenantSettingsService.getUiBaseline(session.tenantId);
  }

  @Patch('settings')
  @Permissions('tenant.manage_settings')
  updateSetting(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: UpdateTenantSettingDto,
  ) {
    return this.tenantSettingsService.upsertSetting(
      session.tenantId,
      session.userId,
      session.role,
      dto.settingGroup,
      dto.settingKey,
      dto.settingValueJson,
    );
  }

  @Patch('ui-baseline')
  @Permissions('tenant.manage_settings')
  updateUiBaseline(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: UpdateTenantUiBaselineDto,
  ) {
    return this.tenantSettingsService.updateUiBaseline(
      session.tenantId,
      session.userId,
      session.role,
      dto,
    );
  }
}
