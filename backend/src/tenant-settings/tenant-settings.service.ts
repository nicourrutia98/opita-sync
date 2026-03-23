import { Injectable } from '@nestjs/common';
import { toJson } from '../common/database/prisma-json.util';
import { PrismaService } from '../common/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateTenantUiBaselineDto } from './dto/update-tenant-ui-baseline.dto';

const defaultTenantUiBaseline = {
  branding: {
    appName: 'Opita Sync',
    brandOwner: 'Opita Coders',
    logoUrl: null,
    shortMark: 'OS',
    supportContact: 'support@opitacoders.com',
    legalFooterText: 'Opita Sync by Opita Coders. Pilot environment.',
  },
  themeDefaults: {
    colorThemeMode: 'light',
    contrastMode: 'standard',
    focusIndicatorMode: 'standard',
    contentDensity: 'comfortable',
  },
  accessibilityDefaults: {
    fontScale: 'normal',
    lineSpacingMode: 'normal',
    letterSpacingMode: 'normal',
    reducedMotion: 'system',
    formAssistanceMode: 'guided',
  },
};

@Injectable()
export class TenantSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listForTenant(tenantId: string) {
    return this.prisma.tenantSetting.findMany({
      where: { tenantId },
      orderBy: [{ settingGroup: 'asc' }, { settingKey: 'asc' }],
    });
  }

  async getUiBaseline(tenantId: string) {
    const record = await this.prisma.tenantSetting.findUnique({
      where: {
        tenantId_settingGroup_settingKey: {
          tenantId,
          settingGroup: 'ui',
          settingKey: 'baseline',
        },
      },
    });

    const merged = {
      ...defaultTenantUiBaseline,
      ...((record?.settingValueJson as Record<string, unknown> | null) ?? {}),
    } as typeof defaultTenantUiBaseline;

    return {
      tenantId,
      ...merged,
    };
  }

  async upsertSetting(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    settingGroup: string,
    settingKey: string,
    settingValueJson: Record<string, unknown>,
  ) {
    const existing = await this.prisma.tenantSetting.findUnique({
      where: {
        tenantId_settingGroup_settingKey: {
          tenantId,
          settingGroup,
          settingKey,
        },
      },
    });

    const updated = await this.prisma.tenantSetting.upsert({
      where: {
        tenantId_settingGroup_settingKey: {
          tenantId,
          settingGroup,
          settingKey,
        },
      },
      update: {
        settingValueJson: toJson(settingValueJson),
        version: existing ? existing.version + 1 : 1,
      },
      create: {
        tenantId,
        settingGroup,
        settingKey,
        settingValueJson: toJson(settingValueJson),
      },
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorRoleCode,
      eventCode: 'tenant.setting.upsert',
      entityType: 'tenant_setting',
      entityId: `${settingGroup}:${settingKey}`,
      resultCode: 'success',
      beforeStateJson: existing?.settingValueJson as Record<string, unknown> | undefined,
      afterStateJson: settingValueJson,
    });

    return updated;
  }

  async updateUiBaseline(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    dto: UpdateTenantUiBaselineDto,
  ) {
    const existing = await this.prisma.tenantSetting.findUnique({
      where: {
        tenantId_settingGroup_settingKey: {
          tenantId,
          settingGroup: 'ui',
          settingKey: 'baseline',
        },
      },
    });

    const current =
      ((existing?.settingValueJson as Record<string, unknown> | null) ??
        defaultTenantUiBaseline) as Record<string, unknown>;

    const nextValue = {
      ...defaultTenantUiBaseline,
      ...current,
      branding: {
        ...defaultTenantUiBaseline.branding,
        ...((current.branding as Record<string, unknown> | undefined) ?? {}),
        ...(dto.branding ?? {}),
      },
      themeDefaults: {
        ...defaultTenantUiBaseline.themeDefaults,
        ...((current.themeDefaults as Record<string, unknown> | undefined) ?? {}),
        ...(dto.themeDefaults ?? {}),
      },
      accessibilityDefaults: {
        ...defaultTenantUiBaseline.accessibilityDefaults,
        ...((current.accessibilityDefaults as Record<string, unknown> | undefined) ?? {}),
        ...(dto.accessibilityDefaults ?? {}),
      },
    };

    await this.upsertSetting(
      tenantId,
      actorUserId,
      actorRoleCode,
      'ui',
      'baseline',
      nextValue,
    );

    return {
      tenantId,
      ...nextValue,
    };
  }
}
