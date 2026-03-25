# ADR-005 ? Central connector governance

## Status
Accepted

## Context
Connector sprawl and tenant self-service integrations break governance boundaries.

## Decision
Only centrally governed connectors and credentials may be used. Superadmin controls enablement, credentials, and environment availability.

## Consequences
- connectors stay outside tenant self-service perimeter
- runtime invokes only compiled, approved connector steps
- settings may configure plumbing, but governance owns permissibility

## Execution impact
Connector metadata and credential references must be modeled centrally before runtime connector execution is enabled.
