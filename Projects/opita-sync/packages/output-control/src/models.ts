export interface OutputArtifact {
  outputArtifactId: string;
  runId: string;
  artifactType: 'internal_reasoning' | 'draft' | 'user_visible' | 'outbound_payload' | 'audit_only';
  classificationMarks: string[];
  generatedAt: string;
  content: string;
}

export interface MixedAuthorityAnalysis {
  analysisId: string;
  outputArtifactId: string;
  allowedContentDetected: boolean;
  disallowedContentDetected: boolean;
  mixedAuthority: boolean;
  rationale: string;
}

export interface ReleaseDecisionArtifact {
  releaseDecisionId: string;
  runId: string;
  outputArtifactId: string;
  decision: 'release' | 'release_redacted' | 'hold_for_approval' | 'block';
  reasons: string[];
  governingPolicyRuleIds: string[];
  classificationRefs: string[];
  mixedAuthorityAnalysisRef?: string;
  redactionStrategyRef?: string;
  approvalCaseRef?: string;
  decidedAt: string;
}
