import { ActionPolicyService } from './action-policy.service';

describe('ActionPolicyService', () => {
  const prisma = {
    actionPolicyRule: {
      findUnique: jest.fn(),
    },
    tenantSetting: {
      findUnique: jest.fn(),
    },
  };
  let service: ActionPolicyService;

  beforeEach(() => {
    prisma.actionPolicyRule.findUnique.mockReset();
    prisma.tenantSetting.findUnique.mockReset();
    service = new ActionPolicyService(prisma as never);
  });

  it('blocks when required permissions are missing', async () => {
    const result = await service.evaluate({
      tenantId: 'tenant-1',
      capabilityCode: 'status_query',
      toolCode: 'case_status_reader',
      toolVersion: 'v1',
      riskLevel: 'READ_ONLY',
      requestedExecutionMode: 'SUGGEST',
      hasRequiredPermissions: false,
      contextSufficient: true,
    });

    expect(result.decision).toBe('BLOCKED');
    expect(result.blockReason).toBe('missing_permissions');
  });

  it('uses tenant auto execute when enabled for low-risk tools', async () => {
    prisma.tenantSetting.findUnique.mockResolvedValue({
      settingValueJson: { enabled: true },
    });

    const result = await service.evaluate({
      tenantId: 'tenant-1',
      capabilityCode: 'status_query',
      toolCode: 'case_status_reader',
      toolVersion: 'v1',
      riskLevel: 'AUTO_EXECUTABLE_LOW_RISK',
      requestedExecutionMode: 'SUGGEST',
      hasRequiredPermissions: true,
      contextSufficient: true,
    });

    expect(result.decision).toBe('SUCCESS');
    expect(result.executionMode).toBe('AUTO_EXECUTE');
  });

  it('requires confirmation for write tools', async () => {
    const result = await service.evaluate({
      tenantId: 'tenant-1',
      capabilityCode: 'request_create',
      toolCode: 'case_request_writer',
      toolVersion: 'v1',
      riskLevel: 'WRITE_WITH_CONFIRMATION',
      requestedExecutionMode: 'CONFIRM_THEN_EXECUTE',
      hasRequiredPermissions: true,
      contextSufficient: true,
    });

    expect(result.decision).toBe('REQUIRES_CONFIRMATION');
    expect(result.executionMode).toBe('CONFIRM_THEN_EXECUTE');
    expect(result.confirmationRequired).toBe(true);
  });
});
