import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { TenantSettingsService } from '../tenant-settings/tenant-settings.service';
import { IdentityAccessService } from '../identity-access/identity-access.service';
import { ConversationsService } from '../conversations/conversations.service';
import { CasesService } from '../cases/cases.service';

@Injectable()
export class ContextBuilderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantSettingsService: TenantSettingsService,
    private readonly identityAccessService: IdentityAccessService,
    private readonly conversationsService: ConversationsService,
    private readonly casesService: CasesService,
  ) {}

  async build(input: {
    tenantId: string;
    userId: string;
    role: string;
    conversationId: string;
    intentCode?: string;
    capabilityCode?: string;
    caseId?: string;
    entityId?: string;
    toolCode?: string;
    toolVersion?: string;
    riskLevel?: string;
    executionMode?: string;
    caseType?: string;
    priorityCode?: string;
    structuredFields?: Record<string, unknown>;
    currentUserRequest?: string;
  }) {
    const access = await this.identityAccessService.resolvePermissions(
      input.tenantId,
      input.userId,
      input.role as never,
    );
    const tenantRules = await this.tenantSettingsService.listForTenant(input.tenantId);
    const conversation = await this.conversationsService.getConversation(
      input.tenantId,
      input.conversationId,
    );
    const recentMessages = await this.prisma.conversationMessage.findMany({
      where: {
        tenantId: input.tenantId,
        conversationId: input.conversationId,
      },
      orderBy: { messageIndex: 'desc' },
      take: 10,
    });
    const latestSummary = await this.prisma.conversationSummary.findFirst({
      where: {
        tenantId: input.tenantId,
        conversationId: input.conversationId,
      },
      orderBy: { createdAt: 'desc' },
    });

    const isRequestCreate = input.capabilityCode === 'request_create';
    const caseId =
      !isRequestCreate ? input.caseId ?? conversation.activeCaseId ?? undefined : undefined;
    const caseState = caseId
      ? await this.casesService.getCase(input.tenantId, caseId)
      : null;
    const requestCreateMissingFields = [
      !input.caseType ? 'caseType' : null,
      !input.priorityCode ? 'priorityCode' : null,
    ].filter(Boolean);
    const blockedReasons = isRequestCreate
      ? requestCreateMissingFields.length > 0
        ? ['missing_required_fields']
        : []
      : caseState
        ? []
        : ['missing_case_context'];
    const candidateTools = input.capabilityCode === 'status_query'
      ? [
          {
            toolCode: input.toolCode ?? 'case_status_reader',
            toolVersion: input.toolVersion ?? 'v1',
            riskLevel: input.riskLevel ?? 'READ_ONLY',
            executionMode: input.executionMode ?? 'SUGGEST',
          },
        ]
      : input.capabilityCode === 'request_create'
        ? [
            {
              toolCode: input.toolCode ?? 'case_request_writer',
              toolVersion: input.toolVersion ?? 'v1',
              riskLevel: input.riskLevel ?? 'WRITE_WITH_CONFIRMATION',
              executionMode: input.executionMode ?? 'CONFIRM_THEN_EXECUTE',
            },
          ]
        : [];

    return {
      productRules: [
        'no cross-tenant state mixing',
        'provider memory is not trusted system state',
        'action-level auditability is mandatory',
      ],
      tenantRules: tenantRules.map((entry) => ({
        group: entry.settingGroup,
        key: entry.settingKey,
        value: entry.settingValueJson,
      })),
      userPermissions: access.permissions,
      caseState,
      retrievedContext: {
        documents: [],
        records: caseState ? [caseState] : [],
        summaries: latestSummary ? [latestSummary] : [],
      },
      policyInputs: {
        intentCode: input.intentCode ?? null,
        capabilityCode: input.capabilityCode ?? null,
        toolCode: input.toolCode ?? null,
        toolVersion: input.toolVersion ?? null,
        riskLevel: input.riskLevel ?? null,
        executionMode: input.executionMode ?? null,
        caseType: input.caseType ?? null,
        priorityCode: input.priorityCode ?? null,
      },
      requiredFields: isRequestCreate ? ['caseType', 'priorityCode'] : [],
      recommendedExecutionMode: input.executionMode ?? (isRequestCreate ? 'CONFIRM_THEN_EXECUTE' : 'SUGGEST'),
      confirmationRequired: isRequestCreate,
      candidateTools,
      recentMessages: recentMessages.reverse(),
      openQuestions: isRequestCreate
        ? requestCreateMissingFields.map((field) => `Missing required field: ${field}`)
        : caseState
          ? []
          : ['No active case linked to the conversation'],
      blocked: blockedReasons.length > 0,
      blockReason: blockedReasons[0] ?? null,
      blockedReasons,
    };
  }
}
