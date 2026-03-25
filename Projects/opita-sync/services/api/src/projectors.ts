import type { ApiState } from './state-types.js';
import { readOpenAIProviderStatus } from './provider-config.js';
import { ROLE_PERMISSION_MAP } from '../../../packages/authority/src/index.js';
import type { EffectiveContractSummary } from '../../../packages/contracts/src/index.js';
import type {
  ActivityItemSummary,
  CatalogItemSummary,
  GovernanceSummary,
  InboxItemSummary,
  OperateThreadPageViewModel,
  OperateWorkspaceViewModel,
  RunDetailViewModel,
  SettingsSummary,
  WebAppViewModel
} from './view-models.js';
import type { GovernedArtifact, OperateThreadEntry, StatusBadge } from '../../../packages/ui-artifacts/src/index.js';

function getRunWarnings(record: ApiState['runRecords'][number]): string[] {
  return [
    ...record.admissibility.reasons,
    ...(record.releaseDecision?.reasons ?? []),
    'Approvals are mandatory state transitions when policy requires them.'
  ];
}

function toActionLabel(itemType: string) {
  switch (itemType) {
    case 'approval':
      return 'Review approval';
    case 'blocked_run':
      return 'Inspect block';
    case 'release_review':
      return 'Review release';
    default:
      return 'Open case';
  }
}

function severityForItem(itemType: string): 'low' | 'medium' | 'high' {
  if (itemType === 'blocked_run') return 'high';
  if (itemType === 'approval') return 'medium';
  return 'low';
}

function allowedFinalAction(record?: ApiState['runRecords'][number]): EffectiveContractSummary['allowedFinalAction'] {
  if (!record) return 'draft_only';
  if (record.contract.sendAllowed || record.contract.allowedExternalEffectClass === 'external_send') return 'send_capable';
  if (record.contract.applyAllowed || record.contract.allowedExternalEffectClass === 'internal_apply') return 'apply_capable';
  return 'draft_only';
}

function createHeaderBadges(record?: ApiState['runRecords'][number]): StatusBadge[] {
  return [
    { label: 'policy', value: record?.policyDecision.outcome ?? 'not_evaluated', tone: record?.policyDecision.outcome === 'deny' ? 'danger' : 'muted' },
    { label: 'release', value: record?.releaseDecision?.decision ?? 'not_released', tone: record?.releaseDecision?.decision?.includes('block') ? 'danger' : record?.releaseDecision?.decision?.includes('approval') ? 'warning' : 'brand' },
    { label: 'approval', value: record?.approvalCase?.state ?? 'none', tone: record?.approvalCase?.state === 'pending' ? 'warning' : 'muted' }
  ];
}

function createContractSummary(record: ApiState['runRecords'][number] | undefined): EffectiveContractSummary {
  if (!record) {
    return {
      objective: 'No active governed run.',
      scopeSummary: 'Intent has not been compiled into a governed contract yet.',
      allowedDataDomains: [],
      allowedConnectorIds: [],
      delegationApplied: false,
      approvalMode: 'pre-application',
      allowedFinalAction: 'draft_only',
      releaseState: 'not_released',
      runState: 'idle'
    };
  }

  return {
    objective: record.contract.objectiveText,
    scopeSummary: `${record.contract.domainContext} | outcome=${record.contract.requestedOutcome}`,
    allowedDataDomains: record.contract.allowedDataDomains,
    allowedConnectorIds: record.contract.allowedConnectorIds,
    delegationApplied: Boolean(record.contract.delegationContextId),
    approvalMode: record.contract.approvalExpectationMode,
    allowedFinalAction: allowedFinalAction(record),
    releaseState: record.releaseDecision?.decision ?? 'not_released',
    runState: record.run.state
  };
}

function classificationNotes(record: ApiState['runRecords'][number]): string[] {
  return [...record.classification.handlingObligations, ...record.classification.releaseRestrictions];
}

function analysisArtifacts(record: ApiState['runRecords'][number]): GovernedArtifact[] {
  return record.analysisResult?.artifacts ?? [];
}

function operateThread(state: ApiState, record?: ApiState['runRecords'][number]): OperateThreadEntry[] {
  const entries: OperateThreadEntry[] = [];
  const latestChat = state.chatRecords[state.chatRecords.length - 1];

  if (latestChat?.latestUserMessage) {
    entries.push({
      entryId: `chat-user:${latestChat.chatId}`,
      actor: 'user',
      body: latestChat.latestUserMessage,
      createdAt: latestChat.updatedAt,
      artifacts: []
    });
  }

  if (record) {
    entries.push({
      entryId: `orchestrator:intent:${record.runId}`,
      actor: 'orchestrator',
      title: 'Interpreted intent',
      body: `The platform interpreted the request as: ${record.contract.objectiveText}`,
      artifacts: [
        {
          type: 'kv_summary',
          title: 'Effective contract',
          items: [
            { key: 'Objective', value: record.contract.objectiveText, emphasis: true },
            { key: 'Scope', value: record.contract.domainContext },
            { key: 'Allowed data', value: record.contract.allowedDataDomains.join(', ') || 'none' },
            { key: 'Allowed connectors', value: record.contract.allowedConnectorIds.join(', ') || 'none' },
            { key: 'Approval', value: record.contract.approvalExpectationMode },
            { key: 'Final effect', value: allowedFinalAction(record).replace('_', ' ') }
          ]
        },
        {
          type: 'status_badges',
          badges: createHeaderBadges(record)
        }
      ]
    });

    entries.push({
      entryId: `system:policy:${record.runId}`,
      actor: 'system',
      title: 'Policy validation',
      artifacts: [
        {
          type: 'policy_notice',
          title: 'Effective policy outcome',
          message: `Policy returned ${record.policyDecision.outcome}. Classification ceiling=${record.classification.classification.level}.`,
          tone: record.policyDecision.outcome === 'deny' ? 'danger' : record.admissibility.status === 'approval_required' ? 'warning' : 'brand',
          nextActions: record.admissibility.reasons
        }
      ]
    });

    if (record.analysisResult) {
      entries.push({
        entryId: `system:analysis:${record.runId}`,
        actor: 'system',
        title: 'Governed analysis output',
        body: record.analysisResult.summary,
        artifacts: analysisArtifacts(record)
      });
    }

    if (record.releaseDecision) {
      entries.push({
        entryId: `system:release:${record.runId}`,
        actor: 'system',
        title: 'Output control outcome',
        artifacts:
          record.releaseDecision.decision === 'release_redacted'
            ? [
                {
                  type: 'redaction_notice',
                  title: 'Release decision',
                  message: `Output control returned ${record.releaseDecision.decision}.`,
                  releaseOutcome: 'release_redacted'
                }
              ]
            : [
                {
                  type: 'policy_notice',
                  title: 'Release decision',
                  message: `Output control returned ${record.releaseDecision.decision}.`,
                  tone: record.releaseDecision.decision === 'block' ? 'danger' : 'brand',
                  nextActions: record.releaseDecision.reasons
                }
              ]
      });
    }
  } else {
    entries.push({
      entryId: 'system:empty',
      actor: 'system',
      title: 'Operate workspace',
      body: 'Express intent to build a governed contract. The platform will validate policy, compile the plan, and control output release.',
      artifacts: [
        {
          type: 'cta_bar',
          title: 'Suggested starts',
          actions: [
            { id: 'start_run', label: 'Draft a customer follow-up', intent: 'start_run', tone: 'brand' },
            { id: 'open_panel', label: 'Review governance context', intent: 'open_panel', tone: 'muted' }
          ]
        }
      ]
    });
  }

  if (latestChat?.latestAssistantMessage) {
    entries.push({
      entryId: `chat-assistant:${latestChat.chatId}`,
      actor: 'orchestrator',
      title: 'Orchestrator guidance',
      body: latestChat.latestAssistantMessage,
      createdAt: latestChat.updatedAt,
      artifacts: latestChat.latestProposals.length
        ? [
            {
              type: 'data_table',
              title: 'Governed capability suggestions',
              columns: ['Asset', 'Approval', 'Rationale'],
              rows: latestChat.latestProposals.map((proposal) => [
                proposal.assetId ?? proposal.name,
                proposal.requiresApproval ? 'approval likely' : 'suggestion only',
                proposal.rationale ?? proposal.intentSummary ?? 'Governed fit'
              ])
            }
          ]
        : []
    });
  }

  return entries;
}

function sidePanelEntries(state: ApiState, record?: ApiState['runRecords'][number]) {
  const history = [...state.runRecords].slice(-6).reverse().map<OperateThreadEntry>((item) => ({
    entryId: `history:${item.runId}`,
    actor: 'system',
    title: item.runId,
    body: `${item.contract.objectiveText} -> ${item.run.state}`,
    artifacts: [
      {
        type: 'status_badges',
        badges: [
          { label: 'run', value: item.run.state, tone: 'muted' },
          { label: 'release', value: item.releaseDecision?.decision ?? 'not_released', tone: 'brand' }
        ]
      }
    ]
  }));

  const defaultEntry = (title: string, body: string): OperateThreadEntry[] => [{ entryId: `empty:${title}`, actor: 'system', title, body, artifacts: [] }];

  const panels: OperateWorkspaceViewModel['sidePanel'] = {
    contract: record
      ? [{
          entryId: `contract:${record.runId}`,
          actor: 'system',
          title: 'Contract detail',
          artifacts: [
            {
              type: 'kv_summary',
              title: 'Contract fields',
              items: [
                { key: 'Objective', value: record.contract.objectiveText, emphasis: true },
                { key: 'Requested outcome', value: record.contract.requestedOutcome },
                { key: 'Desired output', value: record.contract.desiredOutputForm },
                { key: 'Dataset refs', value: record.contract.targetDatasetRefs?.join(', ') ?? 'none' },
                { key: 'Analysis mode', value: record.contract.requestedAnalysisMode ?? 'none' },
                { key: 'Audience', value: record.contract.disclosureAudience },
                { key: 'Delegation', value: record.contract.delegationContextId ?? 'not applied' }
              ]
            }
          ]
        }]
      : defaultEntry('Contract', 'A contract appears here once intent has been normalized.'),
    plan: record
      ? [{
          entryId: `plan:${record.runId}`,
          actor: 'system',
          title: 'Plan detail',
          artifacts: [
            {
              type: 'timeline',
              title: 'Compiled checkpoints',
              events: record.plan.steps.map((step) => ({
                label: step.stepId,
                detail: step.assetRef
              }))
            },
            ...(record.analysisResult
              ? [
                  {
                    type: 'query_summary' as const,
                    title: 'Governed analysis plan',
                    datasetRef: record.analysisResult.datasetRef,
                    analysisMode: record.analysisResult.analysisMode,
                    requestedChartFamily: record.analysisResult.chartFamily,
                    transforms: ['dataset scope enforced', 'approved transforms only', 'output control checkpoint required'],
                    narrowedFields: ['month', 'region', 'revenue', 'tickets'],
                    releaseMode: record.releaseDecision?.decision ?? 'draft_only'
                  }
                ]
              : [])
          ]
        }]
      : defaultEntry('Plan', 'Compiled plan detail appears after admissibility succeeds.'),
    risk: record
      ? [{
          entryId: `risk:${record.runId}`,
          actor: 'system',
          title: 'Risk detail',
          artifacts: [
            {
              type: 'policy_notice',
              title: 'Risk posture',
              message: `Classification=${record.classification.classification.level}. Mixed authority=${record.classification.mixedAuthorityRisk === 'confirmed' ? 'yes' : 'no'}.`,
              tone: record.classification.mixedAuthorityRisk === 'confirmed' ? 'danger' : 'warning',
              nextActions: [...classificationNotes(record), ...record.admissibility.reasons]
            }
          ]
        }]
      : defaultEntry('Risk', 'Risk detail appears with policy and classification evaluation.'),
    run: record
      ? [{
          entryId: `run:${record.runId}`,
          actor: 'system',
          title: 'Run detail',
          artifacts: [
            {
              type: 'kv_summary',
              title: 'Run context',
              items: [
                { key: 'Run', value: record.runId, emphasis: true },
                { key: 'Environment', value: record.contract.environment },
                { key: 'Approval', value: record.approvalCase?.state ?? 'none' },
                { key: 'Release', value: record.releaseDecision?.decision ?? 'not_released' }
              ]
            }
          ]
        }]
      : defaultEntry('Run', 'Run detail becomes available once execution starts.'),
    history,
    inspector: record
      ? [{
          entryId: `inspector:${record.runId}`,
          actor: 'system',
          title: 'Inspector',
          artifacts: [
            {
              type: 'document_ref',
              title: 'Contract reference',
              refLabel: 'contractRef',
              refValue: `contract:${record.contract.contractId}:r${record.contract.revision}`,
              supportingText: `admissibility=${record.admissibility.decisionId}`
            }
          ]
        }]
      : defaultEntry('Inspector', 'Inspector remains closed until a governed run exists.')
  };

  return panels;
}

export function projectOperateWorkspaceViewModel(state: ApiState, runId?: string | null): OperateWorkspaceViewModel {
  const record = runId ? state.runRecords.find((item) => item.runId === runId) ?? state.runRecords[state.runRecords.length - 1] : state.runRecords[state.runRecords.length - 1];
  return {
    header: {
      workspace: 'Operate',
      tenantLabel: state.settings.tenantName,
      environment: record?.contract.environment ?? state.settings.defaultEnvironment,
      runStatus: record?.run.state ?? 'idle',
      badges: createHeaderBadges(record)
    },
    contractSummary: createContractSummary(record),
    thread: operateThread(state, record),
    sidePanel: sidePanelEntries(state, record),
    quickIntents: [
      'Prepare a governed customer follow-up draft',
      'Summarize the revenue by region dataset and show the top segments',
      'Build a governed chart of revenue trend by region',
      'Summarize the safest next governed action',
      'Check whether this request needs approval before execution'
    ],
    composer: {
      placeholder: 'Describe the outcome you want. The platform will interpret intent, derive a contract, and enforce governance.',
      canExecute: true
    }
  };
}

export function projectOperateThreadPageViewModel(
  state: ApiState,
  runId?: string | null,
  before?: string | null,
  limit = 20
): OperateThreadPageViewModel {
  const safeLimit = Math.max(1, Math.min(100, limit));
  const record = runId ? state.runRecords.find((item) => item.runId === runId) ?? state.runRecords[state.runRecords.length - 1] : state.runRecords[state.runRecords.length - 1];
  const entries = operateThread(state, record);
  const beforeIndex = before ? entries.findIndex((entry) => entry.entryId === before) : -1;
  const endIndex = beforeIndex >= 0 ? beforeIndex : entries.length;
  const startIndex = Math.max(0, endIndex - safeLimit);
  const messages = entries.slice(startIndex, endIndex);
  const hasMore = startIndex > 0;

  return {
    messages,
    nextCursor: hasMore ? messages[0]?.entryId ?? null : null,
    hasMore
  };
}

export function projectWebAppViewModel(state: ApiState): WebAppViewModel {
  const latestRun = state.runRecords[state.runRecords.length - 1];
  const providerStatus = readOpenAIProviderStatus();
  return {
    operate: {
      objective: latestRun?.contract.objectiveText ?? 'No active governed run yet.',
      contractStatus: latestRun?.contract.status ?? 'draft',
      policyState: latestRun?.policyDecision.outcome ?? 'not_evaluated',
      releaseState: latestRun?.releaseDecision?.decision ?? 'not_released',
      warnings: latestRun
        ? [
            ...latestRun.admissibility.reasons,
            ...(latestRun.releaseDecision?.reasons ?? []),
          'Approvals are mandatory state transitions when policy requires them.'
        ]
        : ['Start from intent to compile a governed run before release.']
    },
    operateWorkspace: projectOperateWorkspaceViewModel(state),
    catalog: state.catalog.map((asset) => ({
      assetId: asset.assetId,
      name: asset.name,
      kind: asset.assetKind,
      lifecycleState: asset.lifecycleState,
      approvalMode: asset.approvalMode,
      description: asset.description,
      version: asset.version,
      classificationTags: asset.classificationTags,
      connectorIds: asset.connectorIds,
      publishedSemanticHash: asset.publishedSemanticHash
    })),
    inbox: state.runRecords.flatMap((record) =>
      record.inboxItems.map((item) => ({
        itemId: item.inboxItemId,
        type: item.itemType,
        summary: item.summary,
        runId: item.runId,
        actionLabel: toActionLabel(item.itemType),
        severity: severityForItem(item.itemType),
        status: item.status
      }))
    ),
    activity: [...state.runRecords]
      .slice(-10)
      .reverse()
      .map((record) => ({
        runId: record.runId,
        state: record.run.state,
        summary: `${record.contract.objectiveText} -> ${record.run.state}`,
        objective: record.contract.objectiveText,
        approvalState: record.approvalCase?.state ?? 'none',
        releaseDecision: record.releaseDecision?.decision ?? 'not_released',
        createdAt: record.run.createdAt,
        updatedAt: record.run.updatedAt,
        actor: record.contract.initiatorUserId
      })),
    governance: {
      activePolicies: state.policySet.rules.map((rule) => `${rule.ruleId}:${rule.effect}`),
      classificationScheme: 'enterprise-default-v1',
      publicationControls: ['Draft/review/approved/published/retired lifecycle enforced', 'prod publication remains superadmin controlled'],
      rules: state.policySet.rules.map((rule) => ({
        ruleId: rule.ruleId,
        effect: rule.effect,
        precedenceWeight: rule.precedenceWeight,
        conditions: rule.conditions,
        obligations: rule.obligations ?? [],
        explanationTemplate: rule.explanationTemplate
      })),
      authorityMatrix: [
        {
          dimension: 'view_asset',
          description: 'See approved assets and their metadata.',
          roles: ['superadmin', 'tenant_admin', 'subadmin', 'end_user', 'approver']
        },
        {
          dimension: 'use_asset',
          description: 'Launch governed assets into Operate.',
          roles: ['superadmin', 'tenant_admin', 'subadmin', 'end_user']
        },
        {
          dimension: 'approve',
          description: 'Pause and resume runs under human oversight.',
          roles: ['superadmin', 'tenant_admin', 'subadmin', 'approver']
        },
        {
          dimension: 'delegate',
          description: 'Relationship-aware authority handoff.',
          roles: ['superadmin', 'tenant_admin']
        }
      ]
    },
    settings: {
      activeProviders: ['OpenAI', 'Anthropic', 'Gemini'],
      environments: ['dev', 'staging', 'prod'],
      governedConnectors: [...new Set(state.catalog.flatMap((asset) => asset.connectorIds))],
      tenantId: state.settings.tenantId,
      tenantName: state.settings.tenantName,
      defaultEnvironment: state.settings.defaultEnvironment,
      preferredProvider: state.settings.preferredProvider,
      connectorNotes: state.settings.connectorNotes,
      connectors: [...new Set(state.catalog.flatMap((asset) => asset.connectorIds))].map((connectorId) => ({
        connectorId,
        name: connectorId.replace('connector_', '').replace(/_/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase()),
        owner: 'platform-owner',
        status: 'active'
      })),
      credentials: [...new Set(state.catalog.flatMap((asset) => asset.connectorIds))].map((connectorId) => ({
        credentialScopeId: `cred:${connectorId}`,
        status: 'governed',
        connectorId
      })),
      authConfig: [
        { label: 'SSO', value: 'Configured externally' },
        { label: 'SCIM', value: 'Tenant provisioned' },
        { label: 'Invitations', value: 'Tenant admin governed' }
      ],
      providerStatus
    }
  };
}

export function projectCatalogViewModel(state: ApiState): { items: CatalogItemSummary[] } {
  return {
    items: state.catalog.map((asset) => ({
      assetId: asset.assetId,
      name: asset.name,
      kind: asset.assetKind,
      description: asset.description,
      lifecycleState: asset.lifecycleState,
      version: asset.version,
      approvalMode: asset.approvalMode,
      classificationTags: asset.classificationTags,
      connectorIds: asset.connectorIds,
      publishedSemanticHash: asset.publishedSemanticHash
    }))
  };
}

export function projectInboxViewModel(state: ApiState): { items: InboxItemSummary[] } {
  return {
    items: state.runRecords.flatMap((record) =>
      record.inboxItems.map((item) => ({
        itemId: item.inboxItemId,
        type: item.itemType,
        status: item.status,
        summary: item.summary,
        runId: item.runId,
        actionLabel: toActionLabel(item.itemType),
        severity: severityForItem(item.itemType)
      }))
    )
  };
}

export function projectActivityViewModel(state: ApiState): { items: ActivityItemSummary[] } {
  return {
    items: [...state.runRecords]
      .slice(-20)
      .reverse()
      .map((record) => ({
        runId: record.runId,
        objective: record.contract.objectiveText,
        state: record.run.state,
        approvalState: record.approvalCase?.state ?? 'none',
        releaseDecision: record.releaseDecision?.decision ?? 'not_released',
        createdAt: record.run.createdAt,
        updatedAt: record.run.updatedAt,
        actor: record.contract.initiatorUserId
      }))
  };
}

export function projectGovernanceViewModel(state: ApiState): GovernanceSummary {
  return {
    policySetId: state.policySet.policySetId,
    version: state.policySet.version,
    scope: state.policySet.scope,
    status: state.policySet.status,
    classificationScheme: 'enterprise-default-v1',
    rules: state.policySet.rules.map((rule) => ({
      ruleId: rule.ruleId,
      effect: rule.effect,
      precedenceWeight: rule.precedenceWeight,
      conditions: rule.conditions,
      obligations: rule.obligations ?? [],
      explanationTemplate: rule.explanationTemplate
    })),
    authorityMatrix: [
      {
        dimension: 'view_asset',
        description: 'See approved assets and their metadata.',
        roles: ['superadmin', 'tenant_admin', 'subadmin', 'end_user', 'approver']
      },
      {
        dimension: 'use_asset',
        description: 'Launch governed assets into Operate.',
        roles: ['superadmin', 'tenant_admin', 'subadmin', 'end_user']
      },
      {
        dimension: 'approve',
        description: 'Pause and resume runs under human oversight.',
        roles: ['superadmin', 'tenant_admin', 'subadmin', 'approver']
      },
      {
        dimension: 'delegate',
        description: 'Relationship-aware authority handoff.',
        roles: ['superadmin', 'tenant_admin']
      }
    ],
    publicationControls: [
      'Draft/review/approved/published/retired lifecycle enforced',
      'Prod publication remains superadmin controlled',
      'Breaking semantic changes create new identities'
    ]
  };
}

export function projectSettingsViewModel(state: ApiState): SettingsSummary {
  const connectors = [...new Set(state.catalog.flatMap((asset) => asset.connectorIds))].map((connectorId) => ({
    connectorId,
    name: connectorId.replace('connector_', '').replace(/_/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase()),
    owner: 'platform-owner',
    status: 'active'
  }));

  return {
    tenantId: state.settings.tenantId,
    tenantName: state.settings.tenantName,
    defaultEnvironment: state.settings.defaultEnvironment,
    preferredProvider: state.settings.preferredProvider,
    connectorNotes: state.settings.connectorNotes,
    environments: ['dev', 'staging', 'prod'],
    activeProviders: ['OpenAI', 'Anthropic', 'Gemini'],
    connectors,
    credentials: connectors.map((connector) => ({
      credentialScopeId: `cred:${connector.connectorId}`,
      status: 'governed',
      connectorId: connector.connectorId
    })),
    authConfig: [
      { label: 'SSO', value: 'Configured externally' },
      { label: 'SCIM', value: 'Tenant provisioned' },
      { label: 'Invitations', value: 'Tenant admin governed' }
    ],
    providerStatus: readOpenAIProviderStatus()
  };
}

export function projectRunDetailViewModel(record: ApiState['runRecords'][number]): RunDetailViewModel {
  return {
    runId: record.runId,
    objective: record.contract.objectiveText,
    tenantId: record.contract.tenantId,
    environment: record.contract.environment,
    actor: record.contract.initiatorUserId,
    contractStatus: record.contract.status,
    approvalMode: record.contract.approvalExpectationMode,
    policyOutcome: record.policyDecision.outcome,
    classificationLevel: record.classification.classification.level,
    runState: record.run.state,
    releaseDecision: record.releaseDecision?.decision ?? 'not_released',
    approvalState: record.approvalCase?.state ?? 'none',
    warnings: getRunWarnings(record),
    planSteps: record.run.planSnapshot.steps.map((step) => ({
      stepId: step.stepId,
      assetRef: step.assetRef,
      status: 'planned'
    })),
    timeline: record.runtimeEvents.map((event) => ({
      occurredAt: event.occurredAt,
      label: event.eventType,
      stateFrom: event.fromState,
      stateTo: event.toState,
      detail: event.reason
    })),
    outputArtifactContent: record.analysisResult?.summary ?? (record.releaseDecision ? `Governed output for ${record.runId}` : undefined),
    lastUpdatedAt: record.run.updatedAt
  };
}

export function projectRunListViewModel(state: ApiState): { items: Array<ReturnType<typeof projectRunDetailViewModel>> } {
  return {
    items: [...state.runRecords].slice(-20).reverse().map((record) => projectRunDetailViewModel(record))
  };
}
