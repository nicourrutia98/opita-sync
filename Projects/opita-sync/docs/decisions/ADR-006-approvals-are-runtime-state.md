# ADR-006 ? Approvals are runtime state transitions

## Status
Accepted

## Context
Approvals materially affect whether work may start, continue, or apply effects.

## Decision
Approvals are explicit runtime state transitions, not notifications or secondary UX hints.

## Consequences
- Inbox becomes actionable work queue
- runtime must pause/resume against approval cases
- approval decisions are auditable and bound to run/contract/plan context

## Execution impact
Runtime and approvals must be implemented together at the state-machine boundary.
