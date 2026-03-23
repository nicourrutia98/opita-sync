import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ActionPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluate(input: {
    tenantId: string;
    capabilityCode: string;
    toolCode: string;
    toolVersion: string;
    riskLevel:
      | 'READ_ONLY'
      | 'DRAFT_ONLY'
      | 'WRITE_WITH_CONFIRMATION'
      | 'AUTO_EXECUTABLE_LOW_RISK';
    requestedExecutionMode?: 'SUGGEST' | 'CONFIRM_THEN_EXECUTE' | 'AUTO_EXECUTE' | null;
    hasRequiredPermissions: boolean;
    contextSufficient: boolean;
    sensitivity?: 'normal' | 'sensitive';
  }) {
    const prisma = this.prisma as any;
    const policyRule = await prisma.actionPolicyRule.findUnique({
      where: {
        tenantId_capabilityCode_toolCode_toolVersion: {
          tenantId: input.tenantId,
          capabilityCode: input.capabilityCode,
          toolCode: input.toolCode,
          toolVersion: input.toolVersion,
        },
      },
    });
    const autoExecuteSetting = await prisma.tenantSetting.findUnique({
      where: {
        tenantId_settingGroup_settingKey: {
          tenantId: input.tenantId,
          settingGroup: 'orchestrator',
          settingKey: 'auto_execute_low_risk_enabled',
        },
      },
    });
    const tenantAutoExecuteEnabled =
      autoExecuteSetting?.settingValueJson &&
      typeof autoExecuteSetting.settingValueJson === 'object' &&
      'enabled' in autoExecuteSetting.settingValueJson
        ? Boolean((autoExecuteSetting.settingValueJson as { enabled?: boolean }).enabled)
        : false;

    if (!input.hasRequiredPermissions) {
      return {
        decision: 'BLOCKED' as const,
        executionMode: 'SUGGEST' as const,
        confirmationRequired: false,
        confirmationStatus: 'NOT_REQUIRED' as const,
        blockReason: 'missing_permissions',
      };
    }

    if (!input.contextSufficient) {
      return {
        decision: 'BLOCKED' as const,
        executionMode: 'SUGGEST' as const,
        confirmationRequired: false,
        confirmationStatus: 'NOT_REQUIRED' as const,
        blockReason: 'context_insufficient',
      };
    }

    if (input.riskLevel === 'WRITE_WITH_CONFIRMATION') {
      return {
        decision: 'REQUIRES_CONFIRMATION' as const,
        executionMode: 'CONFIRM_THEN_EXECUTE' as const,
        confirmationRequired: true,
        confirmationStatus: 'PENDING' as const,
        blockReason: null,
      };
    }

    if (input.riskLevel === 'AUTO_EXECUTABLE_LOW_RISK') {
      const executionMode = tenantAutoExecuteEnabled
        ? 'AUTO_EXECUTE'
        : 'SUGGEST';
      return {
        decision: 'SUCCESS' as const,
        executionMode,
        confirmationRequired: false,
        confirmationStatus: 'NOT_REQUIRED' as const,
        blockReason: null,
      };
    }

    return {
      decision: 'SUCCESS' as const,
      executionMode:
        policyRule?.defaultExecutionMode ??
        input.requestedExecutionMode ??
        'SUGGEST',
      confirmationRequired: false,
      confirmationStatus: 'NOT_REQUIRED' as const,
      blockReason: null,
    };
  }
}
