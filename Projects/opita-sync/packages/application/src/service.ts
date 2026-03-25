import { createExecutionContract, type ExecutionContract } from '../../contracts/src/index.js';
import type { NormalizeIntentInput, NormalizeIntentOutput } from './models.js';

export function normalizeIntent(input: NormalizeIntentInput): NormalizeIntentOutput {
  return {
    objectiveText: input.rawIntent.trim(),
    requestedOutcome: input.requestedWorkflowAssetId ? 'workflow_execution' : input.requestedActionAssetId ? 'action_execution' : 'governed_execution_request',
    successCriteria: ['contract normalized', 'await admissibility evaluation'],
    domainContext: input.requestedWorkflowAssetId ? 'catalog_workflow' : input.requestedActionAssetId ? 'catalog_action' : 'operate'
  };
}

export function buildContractFromNormalizedIntent(input: NormalizeIntentInput & {
  contractId: string;
  revision: number;
  normalized: NormalizeIntentOutput;
}): ExecutionContract {
  return createExecutionContract({
    contractId: input.contractId,
    revision: input.revision,
    tenantId: input.tenantId,
    environment: input.environment,
    initiatorUserId: input.initiatorUserId,
    authorityContextId: input.authorityContextId,
    sourceType: input.sourceType,
    objectiveText: input.normalized.objectiveText,
    requestedOutcome: input.normalized.requestedOutcome,
    successCriteria: input.normalized.successCriteria,
    urgency: 'normal',
    domainContext: input.normalized.domainContext,
    includedEntities: [],
    excludedEntities: [],
    allowedDataDomains: [],
    excludedDataDomains: [],
    allowedExternalEffectClass: 'draft_only',
    requestedActionAssetId: input.requestedActionAssetId,
    requestedWorkflowAssetId: input.requestedWorkflowAssetId,
    dynamicCompositionRequested: false,
    classificationCeiling: 'confidential',
    allowedConnectorIds: [],
    allowedCredentialScopeIds: [],
    approvalExpectationMode: 'auto',
    draftGenerationAllowed: true,
    applyAllowed: false,
    sendAllowed: false,
    outputSensitivityExpectation: 'governed_output_required',
    desiredOutputForm: 'structured_summary',
    disclosureAudience: 'initiator',
    exportRequested: false,
    sendRequested: false,
    draftOnly: true,
    userConstraints: [],
    systemConstraints: ['intent_normalized_before_execution'],
    policyConstraints: [],
    classificationConstraints: [],
    status: 'normalized'
  });
}
