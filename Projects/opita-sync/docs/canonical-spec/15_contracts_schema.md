# 15. Contracts Schema
## Purpose
Define the canonical schema surface for execution contracts.
## ExecutionContract
### Identity
- contract_id
- revision
- tenant_id
- environment (dev | staging | prod)
- initiator_user_id
- authority_context_id
- source_type (chat | catalog_launch | automation_event)
- created_at
- updated_at
### Objective
- objective_text
- requested_outcome
- success_criteria[]
- urgency
- domain_context
### Scope
- included_entities[]
- excluded_entities[]
- allowed_data_domains[]
- excluded_data_domains[]
- allowed_time_window
- allowed_external_effect_class
### Capability intent
- requested_action_asset_id?
- requested_workflow_asset_id?
- candidate_action_family?
- candidate_workflow_family?
- dynamic_composition_requested (boolean)
### Governance envelope
- classification_ceiling
- allowed_connector_ids[]
- allowed_credential_scope_ids[]
- delegation_context_id?
- approval_expectation_mode (auto | pre-execution | pre-application | double_approval)
- draft_generation_allowed (boolean)
- apply_allowed (boolean)
- send_allowed (boolean)
- output_sensitivity_expectation
### Output expectation
- desired_output_form
- disclosure_audience
- export_requested (boolean)
- send_requested (boolean)
- draft_only (boolean)
### Constraints
- user_constraints[]
- system_constraints[]
- policy_constraints[]
- classification_constraints[]
### Status
- draft
- normalized
- restricted
- approval_required
- admissible
- denied
- compiled
- executed
- release_resolved
## ContractRevision
- contract_id
- revision
- previous_revision?
- changed_fields[]
- governance_relevant_change (boolean)
- created_at
- actor_id
- snapshot_ref
## AdmissibilityRequestEnvelope
- contract_snapshot_ref
- effective_authority_ref
- policy_snapshot_ref?
- classification_context_ref
- requested_environment
- requested_asset_refs[]
- requested_connector_refs[]
## Rules
- governance-relevant change requires re-evaluation
- admissibility attaches to exact contract revision
- dynamic composition defaults to false unless explicitly allowed by policy and asset metadata

