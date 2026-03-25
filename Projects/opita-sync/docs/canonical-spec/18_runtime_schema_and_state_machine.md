# 18. Runtime Schema and State Machine
## Purpose
Define the canonical durable runtime model.
## Run
- run_id
- tenant_id
- environment
- contract_id
- contract_revision
- plan_snapshot_ref
- policy_snapshot_ref
- classification_snapshot_ref
- initiator_user_id
- system_identity_id?
- state
- created_at
- updated_at
## Run state enum
- created
- contract_pending
- contract_ready
- policy_evaluating
- policy_denied
- approval_required_pre_execution
- admissible
- compiling
- compiled
- queued
- running
- waiting_external
- waiting_approval
- resuming
- step_failed_retryable
- step_failed_terminal
- execution_completed
- output_review
- release_blocked
- release_redacted
- release_approval_required
- released
- applied
- cancelled
- expired
## RunStep
- run_step_id
- run_id
- step_key
- asset_ref
- state (pending | ready | running | waiting | retryable_failure | terminal_failure | completed | skipped)
- started_at?
- completed_at?
- produced_artifact_refs[]
- retry_count
- wait_reason?
## WaitState
- wait_id
- run_id
- wait_type (approval | external_callback | timer | operator_intervention)
- status (pending | satisfied | expired | cancelled)
- resume_token
- created_at
## RetryRecord
- retry_id
- run_step_id
- attempt_number
- failure_class
- retry_decision
- decided_at
## State transition rules
- execution_completed does not imply released
- approval states may pause and resume the same run identity
- step_failed_retryable may transition back to resuming/running
- step_failed_terminal may terminate execution before output review
- every transition emits an audit event

