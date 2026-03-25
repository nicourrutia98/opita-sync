import type { ApprovalCase } from '../../approvals/src/index.js';
import type { ClassificationEvaluationArtifact } from '../../classification/src/index.js';
import type { PolicyDecisionArtifact } from '../../policy-engine/src/index.js';
import type { MixedAuthorityAnalysis, OutputArtifact, ReleaseDecisionArtifact } from './models.js';

export function analyzeMixedAuthority(input: { outputArtifact: OutputArtifact; allowedContentDetected: boolean; disallowedContentDetected: boolean; rationale: string; }): MixedAuthorityAnalysis {
  return { analysisId: `mixed:${input.outputArtifact.outputArtifactId}`, outputArtifactId: input.outputArtifact.outputArtifactId, allowedContentDetected: input.allowedContentDetected, disallowedContentDetected: input.disallowedContentDetected, mixedAuthority: input.allowedContentDetected && input.disallowedContentDetected, rationale: input.rationale };
}

export function decideRelease(input: { outputArtifact: OutputArtifact; mixedAuthorityAnalysis: MixedAuthorityAnalysis; classificationEvaluation: ClassificationEvaluationArtifact; policyDecision: PolicyDecisionArtifact; approvalCase?: ApprovalCase; }): ReleaseDecisionArtifact {
  const reasons: string[] = [];
  let decision: ReleaseDecisionArtifact['decision'] = 'release';
  if (input.mixedAuthorityAnalysis.mixedAuthority) { decision = 'block'; reasons.push('mixed_authority_block_default'); }
  else if (input.classificationEvaluation.releaseRestrictions.includes('block_release')) { decision = 'block'; reasons.push('classification_blocks_release'); }
  else if (input.policyDecision.outcome === 'require_redaction_path') { decision = 'release_redacted'; reasons.push('policy_requires_redaction'); }
  else if (input.approvalCase && input.approvalCase.mode === 'pre-application' && input.approvalCase.state !== 'approved') { decision = 'hold_for_approval'; reasons.push('pre_application_approval_required'); }
  else if (input.approvalCase && input.approvalCase.mode === 'double_approval' && input.approvalCase.state !== 'approved') { decision = 'hold_for_approval'; reasons.push('double_approval_checkpoint_pending'); }
  else { reasons.push('release_allowed'); }
  return { releaseDecisionId: `release:${input.outputArtifact.outputArtifactId}`, runId: input.outputArtifact.runId, outputArtifactId: input.outputArtifact.outputArtifactId, decision, reasons, governingPolicyRuleIds: [...input.policyDecision.matchedRuleIds], classificationRefs: [input.classificationEvaluation.artifactId], mixedAuthorityAnalysisRef: input.mixedAuthorityAnalysis.analysisId, redactionStrategyRef: decision === 'release_redacted' ? 'redaction:policy_path' : undefined, approvalCaseRef: input.approvalCase?.approvalCaseId, decidedAt: new Date().toISOString() };
}
