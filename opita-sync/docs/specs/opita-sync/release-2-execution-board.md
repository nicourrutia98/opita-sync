# Opita Sync Release 2 Execution Board

## Release Scope

Release 2 modules:
- 03. Bitacora Operativa
- 05. Catalogo de Capacidades
- 06. Gobierno de Herramientas
- 07. Parametrizacion del Tenant

Release objective:
- Add governed operational depth through log and evidence management, capability lifecycle control, tool governance, and bounded tenant self-service configuration.

## Workstreams and Tickets

### Contracts and API Integration

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R2-C01 | Contracts | Define and version `OperationalLogEntryDto` with evidence metadata and before/after snapshots. | None | Log DTO schema published under `src/services/api` with version note and examples. |
| R2-C02 | Contracts | Define and version `CapabilityDto` including activation state and policy mode references. | None | Capability contract supports tenant-scoped active/inactive visibility. |
| R2-C03 | Contracts | Define and version `ToolGovernanceDto` with risk class, certification state, environment scope, and policy ceilings. | None | Tool governance contract supports allow, deny, and blocked reasons. |
| R2-C04 | Contracts | Extend `TenantConfigDto` for approved library changes and certified capability toggles. | None | Tenant configuration contract enforces bounded option set. |
| R2-C05 | Integration | Connect bitacora, capability, tool governance, and tenant config endpoints against remote staging. | R2-C01, R2-C02, R2-C03, R2-C04 | All Release 2 read/write paths run with remote adapters and typed mapping. |

### UI and Runtime Behavior

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R2-U01 | UI | Implement bitacora timeline and evidence entry flow with before/after rendering where required. | R2-C01, R2-C05 | Tecnico and supervisor can create/view governed log entries with visible history impact. |
| R2-U02 | UI | Implement capability catalog surfaces with tenant-scoped active/inactive state and policy mode visibility. | R2-C02, R2-C05 | Admin tenant sees only allowed capabilities and mapped policy posture. |
| R2-U03 | UI | Implement tool governance visibility for internal actors and blocked execution messaging for non-permitted paths. | R2-C03, R2-C05 | Supervisor/admin views show risk/certification state and execution constraints. |
| R2-U04 | UI | Implement tenant parameter editing within closed library and certified capability toggles. | R2-C04, R2-C05 | Config writes apply only within guardrails and produce actionable validation feedback. |

### Audit and Governance Controls

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R2-A01 | Audit | Extend audit taxonomy for bitacora writes, capability activation changes, tool policy decisions, and tenant config mutations. | R2-C01, R2-C02, R2-C03, R2-C04 | Taxonomy includes actor, tenant, before/after, policy decision, and result status. |
| R2-A02 | Governance | Enforce split-governance boundaries: tenant admins cannot certify tools or override global policy ceilings. | R2-U02, R2-U03, R2-U04 | Allow/deny scenarios pass for boundary-sensitive actions. |
| R2-A03 | Audit | Ensure every Release 2 mutation exposes correlated audit IDs in UI and API response metadata. | R2-A01, R2-C05 | Correlation ID is visible and queryable for all sensitive operations. |

### Test and Quality Gates

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R2-T01 | Contract tests | Add schema and backward compatibility coverage for Release 2 DTOs. | R2-C01, R2-C02, R2-C03, R2-C04 | Contract suite passes in CI and staging smoke. |
| R2-T02 | Unit/integration | Add coverage for evidence visibility, capability state transitions, tool policy enforcement, and tenant guardrails. | R2-U01, R2-U02, R2-U03, R2-U04 | Integration suite validates allow/deny/blocked paths by role and tenant. |
| R2-T03 | E2E | Add role-based flows for bitacora update, capability toggle, blocked tool execution, and tenant config change. | R2-U01, R2-U02, R2-U03, R2-U04 | Playwright e2e passes on mobile-first and web-first surfaces. |
| R2-T04 | Visual+a11y | Add mobile and desktop visual and a11y checks for all new Release 2 surfaces and states. | R2-U01, R2-U02, R2-U03, R2-U04 | Visual and axe checks pass for loading/empty/error/success and blocked states. |
| R2-T05 | Staging gate | Run full extended regression and publish release evidence artifacts. | R2-T01, R2-T02, R2-T03, R2-T04 | `npm run ci` + staging regression pass and request evidence is updated. |

## Dependency and Execution Order

Execution sequence:
1. Contract baseline: `R2-C01 + R2-C02 + R2-C03 + R2-C04`.
2. Remote integration: `R2-C05`.
3. Governance and UI layer: `R2-U01 + R2-U02 + R2-U03 + R2-U04`.
4. Audit and boundaries: `R2-A01 -> R2-A03` and `R2-A02`.
5. Quality closure: `R2-T01 -> R2-T02 -> R2-T03 -> R2-T04 -> R2-T05`.

Parallelization rules:
- `R2-C01` to `R2-C04` can run in parallel.
- `R2-U01` to `R2-U04` can run in parallel after `R2-C05`, with disjoint write ownership.
- `R2-T01` can start once each related contract is stable, before UI completion.

## Release 2 Done Definition

Release 2 is done only when:

1. All tickets in this board are in `Done`.
2. `npm run ci` is green.
3. Extended staging regression is green:
   - e2e,
   - visual,
   - a11y,
   - remote contract smoke.
4. Active request evidence updated:
   - `validation-log.md`,
   - `compliance-matrix.md`,
   - `residual-risk-summary.md`.
5. Rollback trigger and rollback steps documented for Release 2.

## External Tracker Export

- Ticketization package is now available in:
  - `docs/specs/opita-sync/tracker/external-ticketization-guide.md`
  - `docs/specs/opita-sync/tracker/release-2-ticket-export.csv`
