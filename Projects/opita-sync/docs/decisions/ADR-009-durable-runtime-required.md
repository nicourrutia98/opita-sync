# ADR-009 ? Durable runtime required

## Status
Accepted

## Context
Opita Sync needs waits, callbacks, retries, approvals, and resumable runs.

## Decision
A durable runtime model is mandatory; transient request-response loops are insufficient.

## Consequences
- runs have stable identities and state transitions
- retries, waits, approvals, and callbacks are first-class
- audit trail is reconstructable

## Execution impact
Runtime package and worker boundaries must be designed around durable execution semantics before production workflows are enabled.
