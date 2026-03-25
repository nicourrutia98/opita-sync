# 06. Run State Machine

## Purpose

The runtime must be durable, resumable, and auditable.
Approvals are state transitions, not side notifications.

## Canonical run states
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

## Canonical state transitions

### Contract path
- created -> contract_pending
- contract_pending -> contract_ready
- contract_ready -> policy_evaluating

### Admissibility path
- policy_evaluating -> policy_denied
- policy_evaluating -> approval_required_pre_execution
- policy_evaluating -> admissible

### Compilation path
- admissible -> compiling
- compiling -> compiled

### Execution path
- compiled -> queued
- queued -> running
- running -> waiting_external
- waiting_external -> resuming
- resuming -> running
- running -> waiting_approval
- waiting_approval -> resuming
- running -> step_failed_retryable
- step_failed_retryable -> resuming
- running -> step_failed_terminal
- running -> execution_completed

### Output path
- execution_completed -> output_review
- output_review -> release_blocked
- output_review -> release_redacted
- output_review -> release_approval_required
- output_review -> released
- released -> applied (if external effect applies)

## Runtime rules
- execution_completed does not imply released
- released does not imply applied unless external effect exists
- approval rejection may end the run or reroute it to draft-only outcome
- retries must preserve audit trace
- callbacks and resumptions must preserve run identity
- every transition must be auditable

## Run snapshots
Each run must retain immutable refs to:
- contract revision
- plan snapshot
- policy snapshot
- classification snapshot
- selected asset version(s)
- approval path
- release decision
