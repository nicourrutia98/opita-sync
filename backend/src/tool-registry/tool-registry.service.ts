import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { toJsonValue } from '../common/database/prisma-json.util';
import type { ToolRegistryRecordInput } from '../common/types/tool-registry.types';
import { AuditService } from '../audit/audit.service';

const DEFAULT_STATUS_QUERY_TOOL: Omit<ToolRegistryRecordInput, 'tenantId'> = {
  toolCode: 'case_status_reader',
  toolVersion: 'v1',
  capabilityCode: 'status_query',
  toolType: 'case_reader',
  riskLevel: 'READ_ONLY',
  executionMode: 'SUGGEST',
  certificationStatus: 'PRODUCTION',
  tenantScopeMode: 'tenant_parameterized',
  permissionsRequired: ['case.read'],
  requiresProvider: false,
  rollbackStrategy: 'not_applicable_read_only',
  inputContractRef: 'status_query.input.v1',
  outputContractRef: 'status_query.output.v1',
};

const DEFAULT_REQUEST_CREATE_TOOL: Omit<ToolRegistryRecordInput, 'tenantId'> = {
  toolCode: 'case_request_writer',
  toolVersion: 'v1',
  capabilityCode: 'request_create',
  toolType: 'case_writer',
  riskLevel: 'WRITE_WITH_CONFIRMATION',
  executionMode: 'CONFIRM_THEN_EXECUTE',
  certificationStatus: 'PRODUCTION',
  tenantScopeMode: 'tenant_parameterized',
  permissionsRequired: ['case.create'],
  requiresProvider: false,
  rollbackStrategy: 'case_status_cancel_or_close',
  inputContractRef: 'request_create.input.v1',
  outputContractRef: 'request_create.output.v1',
};

@Injectable()
export class ToolRegistryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async ensureDefaultPolicy(
    tenantId: string,
    input: Pick<ToolRegistryRecordInput, 'capabilityCode' | 'toolCode' | 'toolVersion' | 'riskLevel' | 'executionMode'>,
  ) {
    const prisma = this.prisma as any;
    await prisma.actionPolicyRule.upsert({
      where: {
        tenantId_capabilityCode_toolCode_toolVersion: {
          tenantId,
          capabilityCode: input.capabilityCode,
          toolCode: input.toolCode,
          toolVersion: input.toolVersion,
        },
      },
      update: {
        riskLevel: input.riskLevel,
        defaultExecutionMode: input.executionMode,
      },
      create: {
        tenantId,
        capabilityCode: input.capabilityCode,
        toolCode: input.toolCode,
        toolVersion: input.toolVersion,
        riskLevel: input.riskLevel,
        defaultExecutionMode: input.executionMode,
      },
    });
  }

  async ensureTenantDefaults(tenantId: string) {
    const statusTool = await this.upsert({
      tenantId,
      ...DEFAULT_STATUS_QUERY_TOOL,
    });
    const requestTool = await this.upsert({
      tenantId,
      ...DEFAULT_REQUEST_CREATE_TOOL,
    });
    await this.ensureDefaultPolicy(tenantId, DEFAULT_STATUS_QUERY_TOOL);
    await this.ensureDefaultPolicy(tenantId, DEFAULT_REQUEST_CREATE_TOOL);
    return [statusTool, requestTool];
  }

  async upsert(input: ToolRegistryRecordInput) {
    return (this.prisma as any).toolRegistry.upsert({
      where: {
        tenantId_toolCode_toolVersion: {
          tenantId: input.tenantId,
          toolCode: input.toolCode,
          toolVersion: input.toolVersion,
        },
      },
      update: {
        capabilityCode: input.capabilityCode,
        toolType: input.toolType,
        riskLevel: input.riskLevel as never,
        executionMode: input.executionMode as never,
        certificationStatus: input.certificationStatus as never,
        tenantScopeMode: input.tenantScopeMode,
        permissionsRequiredJson: toJsonValue(input.permissionsRequired),
        requiresProvider: input.requiresProvider ?? false,
        rollbackStrategy: input.rollbackStrategy,
        inputContractRef: input.inputContractRef,
        outputContractRef: input.outputContractRef,
      },
      create: {
        tenantId: input.tenantId,
        toolCode: input.toolCode,
        toolVersion: input.toolVersion,
        capabilityCode: input.capabilityCode,
        toolType: input.toolType,
        riskLevel: input.riskLevel as never,
        executionMode: input.executionMode as never,
        certificationStatus: input.certificationStatus as never,
        tenantScopeMode: input.tenantScopeMode,
        permissionsRequiredJson: toJsonValue(input.permissionsRequired),
        requiresProvider: input.requiresProvider ?? false,
        rollbackStrategy: input.rollbackStrategy,
        inputContractRef: input.inputContractRef,
        outputContractRef: input.outputContractRef,
      },
    });
  }

  async createManaged(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    input: ToolRegistryRecordInput,
  ) {
    const created = await this.upsert({
      ...input,
      tenantId,
      certificationStatus: 'DRAFT',
    });
    await this.ensureDefaultPolicy(tenantId, input);
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorRoleCode,
      capabilityCode: input.capabilityCode,
      eventCode: 'tool.registry.create',
      entityType: 'tool_registry',
      entityId: created.id,
      resultCode: 'success',
      afterStateJson: {
        toolCode: created.toolCode,
        toolVersion: created.toolVersion,
        certificationStatus: created.certificationStatus,
      },
    });
    return created;
  }

  async getById(tenantId: string, toolId: string) {
    const record = await (this.prisma as any).toolRegistry.findFirst({
      where: {
        tenantId,
        id: toolId,
      },
    });
    if (!record) {
      throw new NotFoundException('Tool not found');
    }
    return record;
  }

  async patchManaged(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    toolId: string,
    updates: Partial<ToolRegistryRecordInput>,
  ) {
    const current = await this.getById(tenantId, toolId);
    const updated = await (this.prisma as any).toolRegistry.update({
      where: { id: toolId },
      data: {
        capabilityCode: updates.capabilityCode ?? current.capabilityCode,
        toolType: updates.toolType ?? current.toolType,
        riskLevel: (updates.riskLevel ?? current.riskLevel) as never,
        executionMode: (updates.executionMode ?? current.executionMode) as never,
        certificationStatus: current.certificationStatus as never,
        tenantScopeMode: updates.tenantScopeMode ?? current.tenantScopeMode,
        permissionsRequiredJson: updates.permissionsRequired
          ? toJsonValue(updates.permissionsRequired)
          : current.permissionsRequiredJson,
        requiresProvider: updates.requiresProvider ?? current.requiresProvider,
        rollbackStrategy: updates.rollbackStrategy ?? current.rollbackStrategy,
        inputContractRef: updates.inputContractRef ?? current.inputContractRef,
        outputContractRef: updates.outputContractRef ?? current.outputContractRef,
      },
    });
    await this.ensureDefaultPolicy(tenantId, {
      capabilityCode: updated.capabilityCode,
      toolCode: updated.toolCode,
      toolVersion: updated.toolVersion,
      riskLevel: updated.riskLevel,
      executionMode: updated.executionMode,
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorRoleCode,
      capabilityCode: updated.capabilityCode,
      eventCode: 'tool.registry.update',
      entityType: 'tool_registry',
      entityId: updated.id,
      resultCode: 'success',
      beforeStateJson: {
        certificationStatus: current.certificationStatus,
        riskLevel: current.riskLevel,
        executionMode: current.executionMode,
      },
      afterStateJson: {
        certificationStatus: updated.certificationStatus,
        riskLevel: updated.riskLevel,
        executionMode: updated.executionMode,
      },
    });
    return updated;
  }

  async transitionStatus(
    tenantId: string,
    actorUserId: string,
    actorRoleCode: string,
    toolId: string,
    targetStatus: 'REVIEWED' | 'CERTIFIED' | 'PRODUCTION' | 'DEPRECATED',
  ) {
    const current = await this.getById(tenantId, toolId);
    const validTransition =
      (current.certificationStatus === 'DRAFT' && targetStatus === 'REVIEWED') ||
      (current.certificationStatus === 'REVIEWED' && targetStatus === 'CERTIFIED') ||
      (current.certificationStatus === 'CERTIFIED' && targetStatus === 'PRODUCTION') ||
      (current.certificationStatus !== 'DEPRECATED' && targetStatus === 'DEPRECATED');
    if (!validTransition) {
      throw new BadRequestException(
        `Invalid tool certification transition: ${current.certificationStatus} -> ${targetStatus}`,
      );
    }
    const updated = await (this.prisma as any).toolRegistry.update({
      where: { id: toolId },
      data: {
        certificationStatus: targetStatus,
      },
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorRoleCode,
      capabilityCode: updated.capabilityCode,
      eventCode: `tool.registry.${targetStatus.toLowerCase()}`,
      entityType: 'tool_registry',
      entityId: updated.id,
      resultCode: 'success',
      beforeStateJson: {
        certificationStatus: current.certificationStatus,
      },
      afterStateJson: {
        certificationStatus: updated.certificationStatus,
      },
    });
    return updated;
  }

  async getProductionToolForCapability(tenantId: string, capabilityCode: string) {
    await this.ensureTenantDefaults(tenantId);
    return (this.prisma as any).toolRegistry.findFirst({
      where: {
        tenantId,
        capabilityCode,
        certificationStatus: 'PRODUCTION',
      },
      orderBy: [{ toolCode: 'asc' }, { toolVersion: 'desc' }],
    });
  }

  async getByCodeVersion(tenantId: string, toolCode: string, toolVersion: string) {
    const record = await (this.prisma as any).toolRegistry.findFirst({
      where: {
        tenantId,
        toolCode,
        toolVersion,
      },
    });
    if (!record) {
      throw new NotFoundException('Tool not found');
    }
    return record;
  }

  async listByTenant(tenantId: string, capabilityCode?: string) {
    await this.ensureTenantDefaults(tenantId);
    return (this.prisma as any).toolRegistry.findMany({
      where: {
        tenantId,
        capabilityCode: capabilityCode ?? undefined,
      },
      orderBy: [{ capabilityCode: 'asc' }, { toolCode: 'asc' }, { toolVersion: 'desc' }],
    });
  }
}
