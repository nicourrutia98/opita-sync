import { buildContractFromNormalizedIntent, normalizeIntent } from '../../../packages/application/src/index.js';
import { transitionApprovalCase, createApprovalCase, type ApprovalCase } from '../../../packages/approvals/src/index.js';
import { computeEffectiveAuthority } from '../../../packages/authority/src/index.js';
import { evaluateClassification } from '../../../packages/classification/src/index.js';
import { evaluateAdmissibility, compileExecutionPlan, selectCapabilities, type ExecutionPlanArtifact } from '../../../packages/orchestrator/src/index.js';
import { analyzeMixedAuthority, decideRelease, type OutputArtifact } from '../../../packages/output-control/src/index.js';
import { evaluatePolicy } from '../../../packages/policy-engine/src/index.js';
import { createRunEvent, executeCompiledPlan, resumeRunAfterApproval, type RunEvent, type RunState } from '../../../packages/runtime/src/index.js';
import { projectInboxItems } from '../../../packages/inbox/src/index.js';
import type { ApprovalMode } from '../../../packages/contracts/src/index.js';
import type { ClassificationLevel, RoleAssignment } from '../../../packages/domain/src/index.js';
import type { ApiState, RunRecord } from './state-types.js';

export interface StartRunInput {
  rawIntent: string;
  requestedActionAssetId?: string;
  initiatorUserId?: string;
  tenantId?: string;
  environment?: 'dev' | 'staging' | 'prod';
  approvalMode?: ApprovalMode;
  classificationLevel?: ClassificationLevel;
  mixedAuthority?: boolean;
  externalSend?: boolean;
}

export interface ReleaseCheckInput {
  runId: string;
  mixedAuthority?: boolean;
}

function createRoleAssignments(tenantId: string, userId: string): RoleAssignment[] {
  return [
    {
      tenantId,
      userId,
      roleId: 'end_user',
      grantedAt: new Date().toISOString(),
      grantedBy: 'bootstrap'
    },
    {
      tenantId,
      userId: 'approver_1',
      roleId: 'approver',
      grantedAt: new Date().toISOString(),
      grantedBy: 'bootstrap'
    }
  ];
}

function createProvisionedPlan(record: {
  contractRef: string;
  admissibilityDecisionRef: string;
  selectedAssetRefs: string[];
  approvalMode: ApprovalMode;
}): ExecutionPlanArtifact {
  return {
    planId: `plan:${record.contractRef}:provisional`,
    contractRef: record.contractRef,
    admissibilityDecisionRef: record.admissibilityDecisionRef,
    status: 'compiled',
    selectedAssetRefs: [...record.selectedAssetRefs],
    steps: record.selectedAssetRefs.map((assetRef, index) => ({
      stepId: `step:${index + 1}`,
      assetRef,
      kind: 'action',
      connectorIds: []
    })),
    approvalMode: record.approvalMode,
    outputCheckpointRequired: true
  };
}

function nextRunId(state: ApiState): string {
  return `run_${state.runRecords.length + 1}`;
}

function nextContractId(state: ApiState): string {
  return `contract_${state.runRecords.length + 1}`;
}

function pushTransition(events: RunEvent[], runId: string, eventType: RunEvent['eventType'], fromState: RunState, toState: RunState, reason?: string): void {
  events.push(
    createRunEvent({
      runId,
      eventType,
      fromState,
      toState,
      reason
    })
  );
}

function ensureRunRecord(state: ApiState, runId: string): RunRecord {
  const found = state.runRecords.find((item) => item.runId === runId);
  if (!found) {
    throw new Error(`run_not_found:${runId}`);
  }
  return found;
}

function createOutputArtifact(runId: string): OutputArtifact {
  return {
    outputArtifactId: `out:${runId}`,
    runId,
    artifactType: 'user_visible',
    classificationMarks: ['customer'],
    generatedAt: new Date().toISOString(),
    content: `Governed output for ${runId}`
  };
}

export function startRun(state: ApiState, input: StartRunInput): RunRecord {
  const tenantId = input.tenantId ?? 'tenant_1';
  const environment = input.environment ?? 'dev';
  const initiatorUserId = input.initiatorUserId ?? 'user_1';
  const requestedActionAssetId = input.requestedActionAssetId ?? state.catalog[0]?.assetId;
  if (!requestedActionAssetId) {
    throw new Error('catalog_empty');
  }

  const normalized = normalizeIntent({
    rawIntent: input.rawIntent,
    tenantId,
    environment,
    initiatorUserId,
    authorityContextId: `authority:${initiatorUserId}`,
    sourceType: 'chat',
    requestedActionAssetId
  });

  const asset = state.catalog.find((item) => item.assetId === requestedActionAssetId);
  const approvalMode = input.approvalMode ?? asset?.approvalMode ?? 'pre-application';
  const externalSend = input.externalSend ?? false;

  const contract = buildContractFromNormalizedIntent({
    rawIntent: input.rawIntent,
    tenantId,
    environment,
    initiatorUserId,
    authorityContextId: `authority:${initiatorUserId}`,
    sourceType: 'chat',
    requestedActionAssetId,
    contractId: nextContractId(state),
    revision: 1,
    normalized
  });

  contract.allowedDataDomains = ['customer'];
  contract.allowedConnectorIds = asset ? [...asset.connectorIds] : [];
  contract.allowedCredentialScopeIds = asset ? asset.connectorIds.map((connectorId) => `cred:${connectorId}`) : [];
  contract.approvalExpectationMode = approvalMode;
  contract.allowedExternalEffectClass = externalSend ? 'external_send' : 'draft_only';
  contract.sendRequested = externalSend;
  contract.draftOnly = !externalSend;

  const effectiveAuthority = computeEffectiveAuthority({
    subjectUserId: initiatorUserId,
    tenantId,
    environment,
    roleAssignments: createRoleAssignments(tenantId, initiatorUserId),
    visibleAssetIds: state.catalog.map((item) => item.assetId),
    usableAssetIds: state.catalog.map((item) => item.assetId),
    dataDomains: ['customer']
  });

  const classificationLevel = input.classificationLevel ?? 'confidential';

  const policyDecision = evaluatePolicy({
    policySet: state.policySet,
    matchedRuleIds: externalSend
      ? classificationLevel === 'restricted'
        ? ['require_approval_for_send', 'deny_restricted_send']
        : ['require_approval_for_send']
      : ['allow_customer_drafts']
  });

  const classification = evaluateClassification({
    artifactId: `classification:${contract.contractId}:r${contract.revision}`,
    classification: {
      level: classificationLevel,
      tags: ['customer']
    },
    ceiling: contract.classificationCeiling,
    mixedAuthority: input.mixedAuthority ?? false
  });

  const admissibility = evaluateAdmissibility({
    contract,
    effectiveAuthority,
    policyDecision,
    classificationEvaluation: classification
  });

  const selection = selectCapabilities({
    contract,
    assets: state.catalog,
    effectiveAuthority
  });

  let plan = compileExecutionPlan({
    contract,
    admissibilityDecision: admissibility,
    selection,
    assets: state.catalog
  });

  if (plan.status === 'blocked' && admissibility.status === 'approval_required' && selection.selectedAssetRefs.length > 0) {
    plan = createProvisionedPlan({
      contractRef: `contract:${contract.contractId}:r${contract.revision}`,
      admissibilityDecisionRef: admissibility.decisionId,
      selectedAssetRefs: selection.selectedAssetRefs,
      approvalMode
    });
  }

  if (plan.status === 'blocked') {
    throw new Error(`run_blocked:${plan.blockedReason ?? 'unknown'}`);
  }

  const runId = nextRunId(state);
  let approvalCase: ApprovalCase | undefined;
  if (approvalMode !== 'auto') {
    approvalCase = createApprovalCase({
      approvalCaseId: `approval:${runId}:1`,
      runId,
      contractId: contract.contractId,
      contractRevision: contract.revision,
      mode: approvalMode,
      approverIds: ['approver_1'],
      evidenceRefs: [`contract:${contract.contractId}:r${contract.revision}`]
    });
  }

  const executionResult = executeCompiledPlan({
    contract,
    plan,
    preExecutionApprovalCase:
      approvalMode === 'pre-execution' || approvalMode === 'double_approval'
        ? approvalCase
        : undefined
  });

  const runtimeEvents: RunEvent[] = [];
  runtimeEvents.push(
    createRunEvent({
      runId,
      eventType: 'run.created',
      toState: executionResult.run.state,
      reason: 'run_initialized'
    })
  );

  if (executionResult.run.state === 'waiting_approval') {
    pushTransition(runtimeEvents, runId, 'run.waiting_approval', 'approval_required_pre_execution', 'waiting_approval', 'awaiting_pre_execution_approval');
  }

  if (executionResult.run.state === 'execution_completed') {
    const fromState: RunState = approvalMode === 'auto' || approvalMode === 'pre-application' ? 'queued' : 'resuming';
    pushTransition(runtimeEvents, runId, 'run.execution_completed', fromState, 'execution_completed', 'execution_done');
  }

  const record: RunRecord = {
    runId,
    contract: {
      ...contract,
      status: admissibility.status === 'admissible' ? 'admissible' : admissibility.status === 'approval_required' ? 'approval_required' : admissibility.status === 'denied' ? 'denied' : 'restricted'
    },
    admissibility,
    policyDecision,
    classification,
    plan,
    run: {
      ...executionResult.run,
      runId
    },
    approvalCase,
    releaseDecision: undefined,
    inboxItems: projectInboxItems({ run: { ...executionResult.run, runId }, approvalCase }),
    runtimeEvents
  };

  state.runRecords.push(record);
  return record;
}

export function approvePreExecution(state: ApiState, runId: string, actorId = 'approver_1'): RunRecord {
  const record = ensureRunRecord(state, runId);
  if (!record.approvalCase) {
    throw new Error('approval_case_missing');
  }
  if (!['pre-execution', 'double_approval'].includes(record.approvalCase.mode)) {
    throw new Error('approval_mode_not_pre_execution');
  }

  const { approvalCase } = transitionApprovalCase(record.approvalCase, 'approved', actorId, 'pre_execution_approved');
  const resumed = resumeRunAfterApproval(record.run, approvalCase);
  const execution = executeCompiledPlan({
    contract: record.contract,
    plan: record.plan,
    preExecutionApprovalCase: approvalCase
  });

  record.approvalCase = approvalCase;
  record.run = {
    ...execution.run,
    runId: record.runId
  };
  pushTransition(record.runtimeEvents, runId, 'run.resumed', 'waiting_approval', 'resuming', 'approval_approved');
  pushTransition(record.runtimeEvents, runId, 'run.execution_completed', resumed.state, 'execution_completed', 'execution_done_after_resume');
  record.inboxItems = projectInboxItems({ run: record.run, approvalCase: record.approvalCase, releaseDecision: record.releaseDecision });

  return record;
}

export function runReleaseCheck(state: ApiState, input: ReleaseCheckInput): RunRecord {
  const record = ensureRunRecord(state, input.runId);

  if (!['execution_completed', 'output_review', 'release_approval_required', 'release_redacted', 'release_blocked'].includes(record.run.state)) {
    throw new Error(`invalid_run_state_for_release:${record.run.state}`);
  }

  if (record.run.state === 'execution_completed') {
    pushTransition(record.runtimeEvents, record.runId, 'run.output_review', 'execution_completed', 'output_review', 'release_evaluation_started');
    record.run = {
      ...record.run,
      state: 'output_review',
      updatedAt: new Date().toISOString()
    };
  }

  const outputArtifact = createOutputArtifact(record.runId);
  const mixedAuthorityAnalysis = analyzeMixedAuthority({
    outputArtifact,
    allowedContentDetected: true,
    disallowedContentDetected: input.mixedAuthority ?? record.classification.mixedAuthorityRisk === 'confirmed',
    rationale: 'release check for governed output'
  });

  const releaseDecision = decideRelease({
    outputArtifact,
    mixedAuthorityAnalysis,
    classificationEvaluation: record.classification,
    policyDecision: record.policyDecision,
    approvalCase: record.approvalCase
  });

  record.releaseDecision = releaseDecision;

  const toState: RunState =
    releaseDecision.decision === 'block'
      ? 'release_blocked'
      : releaseDecision.decision === 'hold_for_approval'
        ? 'release_approval_required'
        : releaseDecision.decision === 'release_redacted'
          ? 'release_redacted'
          : 'released';

  if (record.run.state !== toState) {
    pushTransition(
      record.runtimeEvents,
      record.runId,
      releaseDecision.decision === 'block'
        ? 'run.release_blocked'
        : releaseDecision.decision === 'hold_for_approval'
          ? 'run.release_held'
          : 'run.released',
      'output_review',
      toState,
      releaseDecision.reasons.join(',')
    );
  }

  record.run = {
    ...record.run,
    state: toState,
    updatedAt: new Date().toISOString()
  };
  record.inboxItems = projectInboxItems({ run: record.run, approvalCase: record.approvalCase, releaseDecision: record.releaseDecision });

  return record;
}

export function approveRelease(state: ApiState, runId: string, actorId = 'approver_1'): RunRecord {
  const record = ensureRunRecord(state, runId);

  if (!record.approvalCase) {
    throw new Error('approval_case_missing');
  }

  if (!['pre-application', 'double_approval'].includes(record.approvalCase.mode)) {
    throw new Error('approval_mode_not_release');
  }

  if (record.approvalCase.state !== 'approved') {
    const transition = transitionApprovalCase(record.approvalCase, 'approved', actorId, 'release_approved');
    record.approvalCase = transition.approvalCase;
  }

  if (record.run.state === 'release_approval_required') {
    pushTransition(record.runtimeEvents, runId, 'run.released', 'release_approval_required', 'released', 'release_approved');
    record.run = {
      ...record.run,
      state: 'released',
      updatedAt: new Date().toISOString()
    };
  }

  if (record.releaseDecision) {
    record.releaseDecision = {
      ...record.releaseDecision,
      decision: 'release',
      reasons: ['release_allowed_after_approval'],
      decidedAt: new Date().toISOString()
    };
  }

  record.inboxItems = projectInboxItems({ run: record.run, approvalCase: record.approvalCase, releaseDecision: record.releaseDecision });
  return record;
}
