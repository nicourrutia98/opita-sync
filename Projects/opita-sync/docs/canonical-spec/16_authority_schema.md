# 16. Authority Schema
## Purpose
Define the canonical authority and delegation artifacts.
## RoleAssignment
- tenant_id
- user_id
- role_id
- granted_at
- granted_by
- expires_at?
## DelegationGrant
- delegation_id
- from_user_id
- to_user_id
- tenant_id
- status (ctive | revoked | expired)
- scope
- granted_at
- expires_at?
- granted_by
## DelegationScope
- allowed_action_asset_ids[]
- allowed_workflow_asset_ids[]
- allowed_business_areas[]
- allowed_systems[]
- allowed_data_domains[]
- approval_rights[]
- time_window?
## SystemIdentityOwnership
- system_identity_id
- owner_user_id
- tenant_id
- environment
- scope_description
- active (boolean)
## EffectiveAuthorityArtifact
- subject_user_id
- acting_as_user_id?
- tenant_id
- environment
- can_view_assets[]
- can_use_assets[]
- can_access_data_domains[]
- can_generate_draft (boolean)
- can_apply (boolean)
- can_send (boolean)
- can_approve (boolean)
- can_delegate (boolean)
- system_identity_scope_ids[]
- supporting_relationship_refs[]
- computed_at
## Rules
- view/use/data/draft/apply/send/approve/delegate remain separate
- delegation is bounded, revocable, and auditable
- system identities require human ownership
