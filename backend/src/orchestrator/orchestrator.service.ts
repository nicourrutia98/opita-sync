import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CasesService } from '../cases/cases.service';
import { ConfirmationRequestsService } from '../confirmation-requests/confirmation-requests.service';
import { ContextBuilderService } from '../context-builder/context-builder.service';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { ActionPolicyService } from '../action-policy/action-policy.service';
import { PositiveActionsService } from '../positive-actions/positive-actions.service';
import { ToolExecutionsService } from '../tool-executions/tool-executions.service';
import { ToolRegistryService } from '../tool-registry/tool-registry.service';

type RuntimeInput = {
  conversationId: string;
  capabilityCode: string;
  currentUserRequest?: string;
  caseId?: string;
  entityId?: string;
  caseType?: string;
  priorityCode?: string;
  structuredFields?: Record<string, unknown>;
};

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly toolRegistryService: ToolRegistryService,
    private readonly actionPolicyService: ActionPolicyService,
    private readonly toolExecutionsService: ToolExecutionsService,
    private readonly positiveActionsService: PositiveActionsService,
    private readonly confirmationRequestsService: ConfirmationRequestsService,
    private readonly auditService: AuditService,
    private readonly contextBuilderService: ContextBuilderService,
    private readonly casesService: CasesService,
  ) {}

  async execute(session: SessionPrincipal, input: RuntimeInput) {
    if (input.capabilityCode === 'status_query') {
      return this.executeStatusQuery(session, input);
    }

    if (input.capabilityCode === 'request_create') {
      return this.executeRequestCreate(session, input);
    }

    throw new BadRequestException(
      'Only status_query and request_create are supported by the orchestrator runtime in this slice',
    );
  }

  async confirmAndExecute(
    session: SessionPrincipal,
    confirmationId: string,
    confirmationCode?: string,
  ) {
    const confirmation = await this.confirmationRequestsService.confirm(
      session.tenantId,
      confirmationId,
      session.userId,
      session.role,
      confirmationCode,
    );
    const payload =
      confirmation.requestedPayloadJson &&
      typeof confirmation.requestedPayloadJson === 'object'
        ? (confirmation.requestedPayloadJson as Record<string, unknown>)
        : null;
    if (!payload) {
      throw new BadRequestException('Confirmation request payload is invalid');
    }
    if (confirmation.capabilityCode !== 'request_create') {
      throw new BadRequestException(
        'Only request_create confirmations are executable in this slice',
      );
    }

    const tool = await this.toolRegistryService.getByCodeVersion(
      session.tenantId,
      confirmation.toolCode,
      confirmation.toolVersion,
    );
    if (tool.certificationStatus !== 'PRODUCTION') {
      throw new BadRequestException('Confirmed tool is not in production status');
    }
    if (confirmation.conversationId) {
      const existingCase = await this.casesService.findByOriginConversation(
        session.tenantId,
        confirmation.conversationId,
      );
      if (existingCase) {
        throw new BadRequestException(
          'The conversation is already linked to an existing case',
        );
      }
    }

    const createdCase = await this.casesService.createCase(
      session.tenantId,
      session.userId,
      session.role,
      String(payload.caseType),
      String(payload.priorityCode),
      String(payload.requesterUserId ?? confirmation.actorUserId),
      confirmation.conversationId ?? undefined,
      {
        source: 'orchestrator.request_create',
        currentUserRequest: payload.currentUserRequest ?? null,
        structuredFields: payload.structuredFields ?? null,
        confirmationId: confirmation.id,
      },
    );

    const executionAttempt = await this.toolExecutionsService.recordAttempt({
      tenantId: session.tenantId,
      conversationId: confirmation.conversationId ?? null,
      caseId: createdCase.id,
      actorUserId: session.userId,
      intentCode: 'request_create.submit',
      capabilityCode: confirmation.capabilityCode,
      toolCode: confirmation.toolCode,
      toolVersion: confirmation.toolVersion,
      executionMode: tool.executionMode,
      confirmationRequired: true,
      confirmationStatus: 'CONFIRMED',
      executionResult: 'SUCCESS',
      requestPayloadJson: payload,
      responsePayloadJson: {
        caseId: createdCase.id,
        caseCode: createdCase.caseCode,
        statusCode: createdCase.statusCode,
      },
    });

    const auditEvent = await this.auditService.record({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorRoleCode: session.role,
      conversationId: confirmation.conversationId ?? null,
      caseId: createdCase.id,
      capabilityCode: confirmation.capabilityCode,
      eventCode: 'tool.execution.success',
      entityType: 'tool_execution_attempt',
      entityId: executionAttempt.id,
      resultCode: 'success',
      afterStateJson: {
        toolCode: confirmation.toolCode,
        toolVersion: confirmation.toolVersion,
        confirmationId: confirmation.id,
        caseId: createdCase.id,
        caseCode: createdCase.caseCode,
      },
    });

    await this.positiveActionsService.record({
      tenantId: session.tenantId,
      conversationId: confirmation.conversationId ?? null,
      caseId: createdCase.id,
      actorUserId: session.userId,
      capabilityCode: confirmation.capabilityCode,
      toolCode: confirmation.toolCode,
      toolVersion: confirmation.toolVersion,
      executionAttemptId: executionAttempt.id,
      auditEventId: auditEvent.id,
    });

    return {
      capabilityCode: confirmation.capabilityCode,
      toolCode: confirmation.toolCode,
      toolVersion: confirmation.toolVersion,
      executionMode: tool.executionMode,
      executionResult: 'SUCCESS',
      confirmationRequired: false,
      confirmationStatus: 'CONFIRMED',
      payload: {
        caseId: createdCase.id,
        caseCode: createdCase.caseCode,
        statusCode: createdCase.statusCode,
      },
    };
  }

  private async executeStatusQuery(session: SessionPrincipal, input: RuntimeInput) {
    const tool = await this.toolRegistryService.getProductionToolForCapability(
      session.tenantId,
      input.capabilityCode,
    );
    if (!tool) {
      throw new NotFoundException('No production tool available for the capability');
    }

    const permissionsRequired = Array.isArray(tool.permissionsRequiredJson)
      ? tool.permissionsRequiredJson.map((value: unknown) => String(value))
      : [];

    const context = await this.contextBuilderService.build({
      tenantId: session.tenantId,
      userId: session.userId,
      role: session.role,
      conversationId: input.conversationId,
      intentCode: `${input.capabilityCode}.lookup`,
      capabilityCode: input.capabilityCode,
      caseId: input.caseId,
      entityId: input.entityId,
      toolCode: tool.toolCode,
      toolVersion: tool.toolVersion,
      riskLevel: tool.riskLevel,
      executionMode: tool.executionMode,
      currentUserRequest: input.currentUserRequest,
    });

    const hasRequiredPermissions = permissionsRequired.every((permission: string) =>
      session.permissions.includes(permission),
    );

    const policyDecision = await this.actionPolicyService.evaluate({
      tenantId: session.tenantId,
      capabilityCode: input.capabilityCode,
      toolCode: tool.toolCode,
      toolVersion: tool.toolVersion,
      riskLevel: tool.riskLevel,
      requestedExecutionMode: tool.executionMode,
      hasRequiredPermissions,
      contextSufficient: Boolean(input.caseId || input.entityId || context.caseState),
    });

    if (
      policyDecision.decision === 'BLOCKED' ||
      policyDecision.decision === 'REQUIRES_CONFIRMATION'
    ) {
      const blockedAttempt = await this.toolExecutionsService.recordAttempt({
        tenantId: session.tenantId,
        conversationId: input.conversationId,
        caseId: input.caseId ?? null,
        actorUserId: session.userId,
        intentCode: `${input.capabilityCode}.lookup`,
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionMode: policyDecision.executionMode,
        confirmationRequired: policyDecision.confirmationRequired,
        confirmationStatus: policyDecision.confirmationStatus,
        executionResult: policyDecision.decision,
        requestPayloadJson: {
          currentUserRequest: input.currentUserRequest ?? null,
          caseId: input.caseId ?? null,
          entityId: input.entityId ?? null,
        },
        responsePayloadJson: {
          blockReason: policyDecision.blockReason,
          candidateTools: context.candidateTools,
        },
      });

      await this.auditService.record({
        tenantId: session.tenantId,
        actorUserId: session.userId,
        actorRoleCode: session.role,
        conversationId: input.conversationId,
        caseId: input.caseId ?? null,
        capabilityCode: input.capabilityCode,
        eventCode: 'tool.execution.blocked',
        entityType: 'tool_execution_attempt',
        entityId: blockedAttempt.id,
        resultCode:
          policyDecision.decision === 'REQUIRES_CONFIRMATION'
            ? 'requires_confirmation'
            : 'blocked',
        afterStateJson: {
          toolCode: tool.toolCode,
          toolVersion: tool.toolVersion,
          executionMode: policyDecision.executionMode,
          blockReason: policyDecision.blockReason,
        },
      });

      return {
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionMode: policyDecision.executionMode,
        executionResult: policyDecision.decision,
        confirmationRequired: policyDecision.confirmationRequired,
        confirmationStatus: policyDecision.confirmationStatus,
        payload: null,
        blockedReason: policyDecision.blockReason,
      };
    }

    try {
      const resolvedCaseId = input.caseId ?? context.caseState?.id;
      if (!resolvedCaseId) {
        throw new BadRequestException('A visible case reference is required for status_query');
      }
      const caseRecord = await this.casesService.getVisibleCaseForActor(
        session.tenantId,
        resolvedCaseId,
        session.userId,
        session.role,
      );
      const latestVisibleUpdate = caseRecord.contexts[0]
        ? {
            contextType: caseRecord.contexts[0].contextType,
            contextKey: caseRecord.contexts[0].contextKey,
            contextValueJson: caseRecord.contexts[0].contextValueJson,
            updatedAt: caseRecord.contexts[0].updatedAt,
          }
        : null;

      const payload = {
        caseId: caseRecord.id,
        caseCode: caseRecord.caseCode,
        statusCode: caseRecord.statusCode,
        ownerUserId: caseRecord.ownerUserId,
        latestVisibleUpdate,
      };

      const executionAttempt = await this.toolExecutionsService.recordAttempt({
        tenantId: session.tenantId,
        conversationId: input.conversationId,
        caseId: caseRecord.id,
        actorUserId: session.userId,
        intentCode: `${input.capabilityCode}.lookup`,
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionMode: policyDecision.executionMode,
        confirmationRequired: false,
        confirmationStatus: policyDecision.confirmationStatus,
        executionResult: 'SUCCESS',
        requestPayloadJson: {
          currentUserRequest: input.currentUserRequest ?? null,
          caseId: caseRecord.id,
        },
        responsePayloadJson: payload,
      });

      const auditEvent = await this.auditService.record({
        tenantId: session.tenantId,
        actorUserId: session.userId,
        actorRoleCode: session.role,
        conversationId: input.conversationId,
        caseId: caseRecord.id,
        capabilityCode: input.capabilityCode,
        eventCode: 'tool.execution.success',
        entityType: 'tool_execution_attempt',
        entityId: executionAttempt.id,
        resultCode: 'success',
        afterStateJson: {
          toolCode: tool.toolCode,
          toolVersion: tool.toolVersion,
          executionMode: policyDecision.executionMode,
          payload,
        },
      });

      await this.positiveActionsService.record({
        tenantId: session.tenantId,
        conversationId: input.conversationId,
        caseId: caseRecord.id,
        actorUserId: session.userId,
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionAttemptId: executionAttempt.id,
        auditEventId: auditEvent.id,
      });

      return {
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionMode: policyDecision.executionMode,
        executionResult: 'SUCCESS',
        confirmationRequired: false,
        confirmationStatus: policyDecision.confirmationStatus,
        payload,
      };
    } catch (error) {
      const failedAttempt = await this.toolExecutionsService.recordAttempt({
        tenantId: session.tenantId,
        conversationId: input.conversationId,
        caseId: input.caseId ?? null,
        actorUserId: session.userId,
        intentCode: `${input.capabilityCode}.lookup`,
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionMode: policyDecision.executionMode,
        confirmationRequired: false,
        confirmationStatus: policyDecision.confirmationStatus,
        executionResult: 'BLOCKED',
        requestPayloadJson: {
          currentUserRequest: input.currentUserRequest ?? null,
          caseId: input.caseId ?? null,
        },
        responsePayloadJson: {
          message: error instanceof Error ? error.message : 'tool execution failed',
        },
      });

      await this.auditService.record({
        tenantId: session.tenantId,
        actorUserId: session.userId,
        actorRoleCode: session.role,
        conversationId: input.conversationId,
        caseId: input.caseId ?? null,
        capabilityCode: input.capabilityCode,
        eventCode: 'tool.execution.blocked',
        entityType: 'tool_execution_attempt',
        entityId: failedAttempt.id,
        resultCode: 'blocked',
        afterStateJson: {
          toolCode: tool.toolCode,
          toolVersion: tool.toolVersion,
          reason: error instanceof Error ? error.message : 'unknown',
        },
      });

      return {
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        executionMode: policyDecision.executionMode,
        executionResult: 'BLOCKED',
        confirmationRequired: false,
        confirmationStatus: policyDecision.confirmationStatus,
        payload: null,
        blockedReason: error instanceof Error ? error.message : 'tool execution failed',
      };
    }
  }

  private async executeRequestCreate(session: SessionPrincipal, input: RuntimeInput) {
    const tool = await this.toolRegistryService.getProductionToolForCapability(
      session.tenantId,
      input.capabilityCode,
    );
    if (!tool) {
      throw new NotFoundException('No production tool available for the capability');
    }

    const permissionsRequired = Array.isArray(tool.permissionsRequiredJson)
      ? tool.permissionsRequiredJson.map((value: unknown) => String(value))
      : [];
    const hasRequiredPermissions = permissionsRequired.every((permission: string) =>
      session.permissions.includes(permission),
    );

    const context = await this.contextBuilderService.build({
      tenantId: session.tenantId,
      userId: session.userId,
      role: session.role,
      conversationId: input.conversationId,
      intentCode: 'request_create.submit',
      capabilityCode: input.capabilityCode,
      toolCode: tool.toolCode,
      toolVersion: tool.toolVersion,
      riskLevel: tool.riskLevel,
      executionMode: tool.executionMode,
      caseType: input.caseType,
      priorityCode: input.priorityCode,
      structuredFields: input.structuredFields,
      currentUserRequest: input.currentUserRequest,
    });

    const contextSufficient = Boolean(input.caseType && input.priorityCode);
    const policyDecision = await this.actionPolicyService.evaluate({
      tenantId: session.tenantId,
      capabilityCode: input.capabilityCode,
      toolCode: tool.toolCode,
      toolVersion: tool.toolVersion,
      riskLevel: tool.riskLevel,
      requestedExecutionMode: tool.executionMode,
      hasRequiredPermissions,
      contextSufficient,
    });

    const requestedPayload = {
      conversationId: input.conversationId,
      currentUserRequest: input.currentUserRequest ?? null,
      caseType: input.caseType ?? null,
      priorityCode: input.priorityCode ?? null,
      structuredFields: input.structuredFields ?? null,
      requesterUserId: session.userId,
    };

    let confirmationRequest: any = null;
    if (policyDecision.decision === 'REQUIRES_CONFIRMATION') {
      confirmationRequest = await this.confirmationRequestsService.createForExecution({
        tenantId: session.tenantId,
        conversationId: input.conversationId,
        actorUserId: session.userId,
        capabilityCode: input.capabilityCode,
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        requestedPayloadJson: requestedPayload,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      });
    }

    const executionAttempt = await this.toolExecutionsService.recordAttempt({
      tenantId: session.tenantId,
      conversationId: input.conversationId,
      actorUserId: session.userId,
      intentCode: 'request_create.submit',
      capabilityCode: input.capabilityCode,
      toolCode: tool.toolCode,
      toolVersion: tool.toolVersion,
      executionMode: policyDecision.executionMode,
      confirmationRequired: policyDecision.confirmationRequired,
      confirmationStatus: policyDecision.confirmationStatus,
      executionResult: policyDecision.decision,
      requestPayloadJson: requestedPayload,
      responsePayloadJson: {
        openQuestions: context.openQuestions,
        confirmationId: confirmationRequest?.id ?? null,
      },
    });

    await this.auditService.record({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorRoleCode: session.role,
      conversationId: input.conversationId,
      capabilityCode: input.capabilityCode,
      eventCode:
        policyDecision.decision === 'REQUIRES_CONFIRMATION'
          ? 'tool.execution.confirmation_requested'
          : 'tool.execution.blocked',
      entityType: 'tool_execution_attempt',
      entityId: executionAttempt.id,
      resultCode:
        policyDecision.decision === 'REQUIRES_CONFIRMATION'
          ? 'requires_confirmation'
          : 'blocked',
      afterStateJson: {
        toolCode: tool.toolCode,
        toolVersion: tool.toolVersion,
        confirmationId: confirmationRequest?.id ?? null,
        openQuestions: context.openQuestions,
      },
    });

    return {
      capabilityCode: input.capabilityCode,
      toolCode: tool.toolCode,
      toolVersion: tool.toolVersion,
      executionMode: policyDecision.executionMode,
      executionResult: policyDecision.decision,
      confirmationRequired: policyDecision.confirmationRequired,
      confirmationStatus: policyDecision.confirmationStatus,
      confirmationId: confirmationRequest?.id ?? null,
      confirmationCode: confirmationRequest?.confirmationCode ?? null,
      payload:
        policyDecision.decision === 'REQUIRES_CONFIRMATION'
          ? {
              requestedAction: {
                caseType: input.caseType,
                priorityCode: input.priorityCode,
              },
              openQuestions: context.openQuestions,
            }
          : null,
      blockedReason: policyDecision.blockReason,
      openQuestions: context.openQuestions,
    };
  }
}
