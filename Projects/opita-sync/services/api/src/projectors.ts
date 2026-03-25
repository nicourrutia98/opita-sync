import type { ApiState } from './state-types.js';
import { ROLE_PERMISSION_MAP } from '../../../packages/authority/src/index.js';
import type {
  ActivityItemSummary,
  CatalogItemSummary,
  GovernanceSummary,
  InboxItemSummary,
  RunDetailViewModel,
  SettingsSummary,
  WebAppViewModel
} from './view-models.js';

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

export function projectWebAppViewModel(state: ApiState): WebAppViewModel {
  const latestRun = state.runRecords[state.runRecords.length - 1];
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
      tenantId: 'tenant_1',
      tenantName: 'Tenant 1',
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
      ]
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
    tenantId: 'tenant_1',
    tenantName: 'Tenant 1',
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
    ]
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
    outputArtifactContent: record.releaseDecision ? `Governed output for ${record.runId}` : undefined,
    lastUpdatedAt: record.run.updatedAt
  };
}

export function projectRunListViewModel(state: ApiState): { items: Array<ReturnType<typeof projectRunDetailViewModel>> } {
  return {
    items: [...state.runRecords].slice(-20).reverse().map((record) => projectRunDetailViewModel(record))
  };
}
