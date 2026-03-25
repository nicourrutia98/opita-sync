# 20. Approval State Machine
## Purpose
Define canonical approval semantics.
## ApprovalCase
- approval_case_id
- run_id
- run_step_id?
- contract_id
- contract_revision
- mode (uto | pre-execution | pre-application | double_approval)
- state (pending | approved | rejected | expired | revoked | escalated | superseded)
- requested_at
- decided_at?
- approver_ids[]
- evidence_refs[]
## Transitions
- pending -> approved
- pending -> rejected
- pending -> expired
- pending -> revoked
- pending -> escalated
- approved -> superseded
## Runtime integration rules
- pre-execution approval blocks start of execution
- pre-application approval blocks final effect release/application
- double approval requires two distinct checkpoints
- approval rejection may terminate or downgrade run according to policy and plan semantics
