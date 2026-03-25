# ADR-002 ? Explicit execution contract boundary

## Status
Accepted

## Context
Raw prompts are insufficient as executable truth in an enterprise governed system.

## Decision
Every run must be bound to a canonical execution contract revision.

## Consequences
- chat input becomes intent, not execution authority
- contract revisioning is mandatory
- governance-relevant changes require re-evaluation
- approvals and runtime snapshots attach to contract revision

## Execution impact
The contracts package is an early-phase implementation dependency for orchestrator, runtime, approvals, and output control.
