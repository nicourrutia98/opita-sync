# 04. Permission, Policy, Classification, and Approval Model

## Purpose

This model preserves governance semantics explicitly and rejects flat authorization shortcuts.

## Permission model

The following decisions must remain distinct:
- visibility
- usage
- data access
- draft generation
- apply authority
- send authority
- approval authority
- delegation authority
- publication authority
- connector administration authority

## Authorization composition

### RBAC
Provides baseline organizational role assignment.

### ABAC
Adds contextual constraints:
- environment
- classification
- business area
- jurisdiction
- asset lifecycle/publication
- risk level
- requested final effect

### ReBAC
Adds relationship-aware authority:
- manager/delegate
- admin/subadmin hierarchy
- human owner of system identity
- asset visibility/use relationships

### Centralized policy
Provides final hard governance decisions with precedence.

## Core policy principles
- deny by default
- most restrictive rule wins
- no implicit allow from missing evidence
- allow may include obligations
- release decisions may still block after execution success

## Classification model

Canonical levels:
- internal
- confidential
- restricted
- high_impact

Canonical tags:
- pii
- hr
- legal
- finance
- customer
- regulated
- export_controlled

Classification affects:
- retrieval eligibility
- reasoning context eligibility
- contract admissibility
- approval thresholds
- execution compilation
- output release
- export/send behavior
- audit visibility and retention behavior

## Approval model

Supported modes:
- auto
- pre-execution
- pre-application
- double approval

### Semantics
- auto: may execute/apply without extra human gate only if policy and authority permit
- pre-execution: run cannot start until approved
- pre-application: analysis/draft may proceed, but final external effect must wait
- double approval: one gate before execution and one before final apply/release effect

## Approval state machine
- pending
- approved
- rejected
- expired
- revoked
- escalated
- superseded

## Hard rules
- approval authority != usage authority
- approval does not erase output control
- approval is bound to explicit run/contract/plan context
- approval is auditable and resumable

## Mixed-authority rule
If allowed and disallowed content mix together, default outcome is block.
Redaction or escalation requires explicit governed path.
