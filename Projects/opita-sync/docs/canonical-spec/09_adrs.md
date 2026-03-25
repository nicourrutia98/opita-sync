# 09. Architecture Decision Records

## ADR-001
**Decision:** Opita Sync is a governed execution platform, not a free agent loop.

## ADR-002
**Decision:** Execution always requires an explicit execution contract.

## ADR-003
**Decision:** Policy validation happens before execution compilation.

## ADR-004
**Decision:** Visibility, usage, data access, draft generation, apply, send, approve, and delegate remain separate decisions.

## ADR-005
**Decision:** Policy is centralized, versioned, explainable, deny-by-default, and resolved by most restrictive rule wins.

## ADR-006
**Decision:** Enterprise classification applies from the beginning and affects retrieval, planning, execution, and release.

## ADR-007
**Decision:** Catalog assets are governed assets with lifecycle, publication state, metadata, and immutable meaning once published.

## ADR-008
**Decision:** Connectors and credentials remain inside the superadmin governance perimeter.

## ADR-009
**Decision:** Dynamic workflows are allowed only from approved assets.

## ADR-010
**Decision:** Approvals are runtime state transitions, not secondary UX hints.

## ADR-011
**Decision:** Durable runtime is required because runs may pause, resume, retry, and wait on humans or systems.

## ADR-012
**Decision:** Execution completion and output release are separate decisions.

## ADR-013
**Decision:** Mixed-authority output blocks by default; redaction or escalation require governed path.

## ADR-014
**Decision:** Governance and Settings remain separate in both backend ownership and UI IA.

## ADR-015
**Decision:** Providers are configurable (OpenAI, Anthropic, Gemini) but governance remains provider-agnostic.

## ADR-016
**Decision:** Superadmin controls catalog, policies, connectors, credentials, and publication.

## ADR-017
**Decision:** Tenant admins and subadmins govern visibility, usage, and delegation only within higher-order policy limits.

## ADR-018
**Decision:** Breaking changes create a new asset identity.
