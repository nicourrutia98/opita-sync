# ADR-008 ? Governance and Settings stay separate

## Status
Accepted

## Context
Authority/policy/publication semantics become opaque when merged with environment plumbing.

## Decision
Governance and Settings remain distinct backend and UI modules.

## Consequences
- Governance owns policy, classification, authority, publication, approvals semantics
- Settings owns providers, environments, connectors plumbing, credentials references, SSO/SCIM plumbing

## Execution impact
UI and service boundaries must reflect this separation from the first shell implementation.
