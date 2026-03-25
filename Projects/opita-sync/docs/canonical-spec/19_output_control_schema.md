# 19. Output Control Schema
## Purpose
Define the canonical release-control artifact model.
## OutputArtifact
- output_artifact_id
- run_id
- artifact_type (internal_reasoning | draft | user_visible | outbound_payload | audit_only)
- classification_marks[]
- generated_at
- content_ref
## MixedAuthorityAnalysis
- analysis_id
- output_artifact_id
- allowed_content_detected (boolean)
- disallowed_content_detected (boolean)
- mixed_authority (boolean)
- rationale
## ReleaseDecisionArtifact
- release_decision_id
- run_id
- output_artifact_id
- decision (elease | release_redacted | hold_for_approval | block)
- reasons[]
- governing_policy_rule_ids[]
- classification_refs[]
- mixed_authority_analysis_ref?
- redaction_strategy_ref?
- approval_case_ref?
- decided_at
## Rules
- mixed_authority -> block by default
- release_redacted requires explicit allowed redaction path
- hold_for_approval requires approval context, not passive notification
- release decision is mandatory before disclosure or outbound send
