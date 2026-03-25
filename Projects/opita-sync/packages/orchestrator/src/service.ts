import type { CatalogAsset } from '../../catalog/src/index.js';
import { isPublishedInEnvironment } from '../../catalog/src/index.js';
import type { ClassificationEvaluationArtifact } from '../../classification/src/index.js';
import type { ExecutionContract } from '../../contracts/src/index.js';
import type { EffectiveAuthorityArtifact } from '../../authority/src/index.js';
import type { PolicyDecisionArtifact } from '../../policy-engine/src/index.js';
import type {
  AdmissibilityDecisionArtifact,
  CapabilitySelectionResult,
  ExecutionPlanArtifact,
  ExecutionPlanStep,
  InterpretedIntentArtifact
} from './models.js';

function contractRef(contract: ExecutionContract): string {
  return `contract:${contract.contractId}:r${contract.revision}`;
}

export function interpretIntentFromContract(contract: ExecutionContract): InterpretedIntentArtifact {
  return {
    artifactId: `interpreted:${contract.contractId}:r${contract.revision}`,
    contractId: contract.contractId,
    contractRevision: contract.revision,
    inferredIntentType: contract.requestedWorkflowAssetId
      ? 'catalog_workflow'
      : contract.requestedActionAssetId
        ? 'catalog_action'
        : 'operate_request',
    ambiguityFlags: contract.requestedActionAssetId || contract.requestedWorkflowAssetId ? [] : ['no_explicit_asset_selected'],
    candidateAssetRefs: [contract.requestedActionAssetId, contract.requestedWorkflowAssetId].filter(Boolean) as string[]
  };
}

export function evaluateAdmissibility(input: {
  contract: ExecutionContract;
  effectiveAuthority: EffectiveAuthorityArtifact;
  policyDecision: PolicyDecisionArtifact;
  classificationEvaluation?: ClassificationEvaluationArtifact;
}): AdmissibilityDecisionArtifact {
  const ref = contractRef(input.contract);
  const reasons: string[] = [];
  const restrictions = [
    ...input.policyDecision.restrictedConnectorIds.map((item) => `connector:${item}`),
    ...input.policyDecision.restrictedDataDomains.map((item) => `data:${item}`),
    ...(input.classificationEvaluation?.releaseRestrictions ?? [])
  ];

  if (!input.effectiveAuthority.canGenerateDraft) {
    reasons.push('subject_cannot_generate_draft');
    return { decisionId: `${ref}:denied:no_draft`, contractRef: ref, status: 'denied', policyOutcome: 'deny', restrictions, reasons };
  }
  if (input.contract.requestedActionAssetId && !input.effectiveAuthority.canUseAssets.includes(input.contract.requestedActionAssetId)) {
    reasons.push('requested_action_not_usable');
    return { decisionId: `${ref}:denied:asset`, contractRef: ref, status: 'denied', policyOutcome: 'deny', restrictions, reasons };
  }
  if (input.contract.requestedWorkflowAssetId && !input.effectiveAuthority.canUseAssets.includes(input.contract.requestedWorkflowAssetId)) {
    reasons.push('requested_workflow_not_usable');
    return { decisionId: `${ref}:denied:workflow`, contractRef: ref, status: 'denied', policyOutcome: 'deny', restrictions, reasons };
  }
  if (input.classificationEvaluation?.releaseRestrictions.includes('block_release')) {
    reasons.push('classification_exceeds_contract_ceiling');
    return { decisionId: `${ref}:denied:classification`, contractRef: ref, status: 'denied', policyOutcome: 'deny', restrictions, reasons };
  }
  if (input.policyDecision.outcome === 'deny') {
    reasons.push('policy_denied');
    return { decisionId: `${ref}:denied:policy`, contractRef: ref, status: 'denied', policyOutcome: input.policyDecision.outcome, restrictions, reasons };
  }
  if (input.policyDecision.outcome === 'require_approval' || input.contract.approvalExpectationMode !== 'auto') {
    reasons.push('approval_required_before_progress');
    return {
      decisionId: `${ref}:approval_required`,
      contractRef: ref,
      status: 'approval_required',
      policyOutcome: input.policyDecision.outcome,
      restrictions,
      reasons,
      requiredApprovalMode: input.contract.approvalExpectationMode
    };
  }
  if (input.policyDecision.outcome === 'require_redaction_path') {
    reasons.push('admissible_with_output_restrictions');
    return { decisionId: `${ref}:restricted`, contractRef: ref, status: 'restricted', policyOutcome: input.policyDecision.outcome, restrictions, reasons };
  }
  return { decisionId: `${ref}:admissible`, contractRef: ref, status: 'admissible', policyOutcome: input.policyDecision.outcome, restrictions, reasons: ['contract_is_admissible'] };
}

export function selectCapabilities(input: { contract: ExecutionContract; assets: CatalogAsset[]; effectiveAuthority: EffectiveAuthorityArtifact; }): CapabilitySelectionResult {
  const publishedUsableAssets = input.assets.filter((asset) => input.effectiveAuthority.canUseAssets.includes(asset.assetId) && isPublishedInEnvironment(asset, input.contract.environment, [{ environment: input.contract.environment, active: true }]));
  if (input.contract.requestedActionAssetId || input.contract.requestedWorkflowAssetId) {
    const explicitRef = input.contract.requestedActionAssetId ?? input.contract.requestedWorkflowAssetId!;
    const selected = publishedUsableAssets.find((asset) => asset.assetId === explicitRef);
    return { selectionId: `selection:${input.contract.contractId}:explicit`, selectedAssetRefs: selected ? [selected.assetId] : [], dynamicCompositionUsed: false, blockedReason: selected ? undefined : 'requested_asset_not_available_for_execution' };
  }
  if (input.contract.dynamicCompositionRequested) {
    return { selectionId: `selection:${input.contract.contractId}:dynamic`, selectedAssetRefs: publishedUsableAssets.map((asset) => asset.assetId), dynamicCompositionUsed: true, blockedReason: publishedUsableAssets.length > 0 ? undefined : 'no_approved_assets_available_for_dynamic_composition' };
  }
  return { selectionId: `selection:${input.contract.contractId}:none`, selectedAssetRefs: [], dynamicCompositionUsed: false, blockedReason: 'no_explicit_asset_and_dynamic_composition_not_requested' };
}

export function compileExecutionPlan(input: { contract: ExecutionContract; admissibilityDecision: AdmissibilityDecisionArtifact; selection: CapabilitySelectionResult; assets: CatalogAsset[]; }): ExecutionPlanArtifact {
  if (input.admissibilityDecision.status !== 'admissible') {
    return { planId: `plan:${input.contract.contractId}:blocked`, contractRef: contractRef(input.contract), admissibilityDecisionRef: input.admissibilityDecision.decisionId, status: 'blocked', selectedAssetRefs: [], steps: [], approvalMode: input.contract.approvalExpectationMode, outputCheckpointRequired: true, blockedReason: `inadmissible_status:${input.admissibilityDecision.status}` };
  }
  if (input.selection.blockedReason || input.selection.selectedAssetRefs.length === 0) {
    return { planId: `plan:${input.contract.contractId}:blocked-selection`, contractRef: contractRef(input.contract), admissibilityDecisionRef: input.admissibilityDecision.decisionId, status: 'blocked', selectedAssetRefs: [], steps: [], approvalMode: input.contract.approvalExpectationMode, outputCheckpointRequired: true, blockedReason: input.selection.blockedReason ?? 'no_selected_assets' };
  }
  const steps: ExecutionPlanStep[] = [];
  input.selection.selectedAssetRefs.forEach((assetRef) => {
    const asset = input.assets.find((item) => item.assetId === assetRef);
    if (!asset) return;
    if (asset.assetKind === 'action') {
      steps.push({ stepId: `step:${asset.assetId}`, assetRef: asset.assetId, kind: 'action', connectorIds: [...asset.connectorIds] });
      return;
    }
    asset.steps.forEach((step) => {
      steps.push({ stepId: `step:${asset.assetId}:${step.stepId}`, assetRef: step.actionAssetId, kind: 'workflow_step', connectorIds: [...asset.connectorIds] });
    });
  });
  return { planId: `plan:${input.contract.contractId}:r${input.contract.revision}`, contractRef: contractRef(input.contract), admissibilityDecisionRef: input.admissibilityDecision.decisionId, status: 'compiled', selectedAssetRefs: [...input.selection.selectedAssetRefs], steps, approvalMode: input.contract.approvalExpectationMode, outputCheckpointRequired: true };
}
