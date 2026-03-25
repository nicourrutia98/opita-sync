# 17. Policy Engine Schema
## Purpose
Define the canonical policy evaluation inputs and outputs.
## PolicySet
- policy_set_id
- version
- scope (platform | tenant | environment | domain)
- status (draft | approved | active | retired)
- rules[]
- created_at
- activated_at?
## PolicyRule
- rule_id
- effect (deny | allow | allow_with_obligations | require_approval | require_redaction)
- subject_conditions[]
- resource_conditions[]
- action_conditions[]
- context_conditions[]
- precedence_weight
- explanation_template
- obligations[]
## PolicyEvaluationInput
- effective_authority_ref
- contract_snapshot_ref
- asset_metadata_refs[]
- connector_scope_refs[]
- classification_context_ref
- environment
- tenant_id
## PolicyDecisionArtifact
- decision_id
- outcome (deny | allow | allow_with_restrictions | require_approval | require_redaction_path)
- matched_rule_ids[]
- restrictive_rule_ids[]
- obligations[]
- restricted_connector_ids[]
- restricted_data_domains[]
- approval_requirements[]
- explanation_summary
- created_at
## Rules
- deny by default when evidence is insufficient
- most restrictive rule wins
- explanation summary is mandatory
