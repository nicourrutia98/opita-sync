# Opita Sync Release 1 Execution Board

## Release Scope

Release 1 modules:
- 13. Contexto, Memoria Operativa y Resolucion
- 08. Roles, Accesos y Visibilidad
- 02. Casos y Solicitudes
- 01. Chat / Orchestrator
- 09. Auditoria y Trazabilidad

Release objective:
- Enable tenant-scoped case creation and updates from chat and structured views with auditable suggest/confirm/execute behavior.

## Workstreams and Tickets

### Contracts and API Integration

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R1-C01 | Contracts | Define and version `SessionDto`, `CaseSummaryDto`, `CaseDetailDto`, `ConversationDto`, `AuditEventDto`. | None | DTO schemas reviewed and committed under `src/services/api` with version notes. |
| R1-C02 | Contracts | Standardize error envelope and mapping for `401/403/422/5xx`. | R1-C01 | Error contract documented and consumed by service layer with typed mapping. |
| R1-C03 | Integration | Connect `cases` read/write endpoints with tenant and role context. | R1-C01, R1-C02 | Case list, detail, create, update run against remote contract in staging smoke. |
| R1-C04 | Integration | Connect chat/orchestrator endpoint and action mode responses (`suggest`, `confirm_then_execute`, `blocked`). | R1-C01, R1-C02 | Chat flow receives policy mode and action metadata from backend. |
| R1-C05 | Integration | Connect audit query endpoint for case and request trails. | R1-C01, R1-C02 | Audit timeline can be queried by case and actor with consistent payloads. |

### UI and Runtime Behavior

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R1-U01 | UI | Enforce tenant/role visibility in runtime navigation and entity access. | R1-C01 | Users only see allowed views/entities from bootstrap role and tenant scope. |
| R1-U02 | UI | Implement case create/update UX from chat and structured case surfaces with policy mode display. | R1-C03, R1-C04 | User can complete create/update flow and sees mode-specific UI (suggest/confirm/blocked). |
| R1-U03 | UI | Add actionable `422` feedback for case/chat mutations. | R1-C02 | Validation failures render field or action-level guidance without silent errors. |
| R1-U04 | UI | Add audit trail surface in case detail with clear action provenance. | R1-C05 | Case detail shows actor, action, result, and timestamp from audit API. |

### Audit and Governance Controls

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R1-A01 | Audit | Define Release 1 audit taxonomy for chat and case mutations. | R1-C01 | Taxonomy doc approved and mapped to `AuditEventDto`. |
| R1-A02 | Audit | Emit auditable event IDs across case/chat actions and correlate them in UI. | R1-A01, R1-C03, R1-C04 | UI and logs expose stable event IDs for mutation flows. |
| R1-A03 | Governance | Validate permission matrix enforcement for Release 1 actions. | R1-U01 | Matrix scenarios pass for allow/deny/masked outcomes by role and tenant. |

### Test and Quality Gates

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R1-T01 | Contract tests | Add schema and backward compatibility checks for Release 1 DTOs. | R1-C01, R1-C02 | Contract suite passes in CI and staging smoke. |
| R1-T02 | Unit/integration | Add coverage for policy mode routing, permission checks, and error mapping. | R1-U01, R1-U02, R1-U03 | Integration tests assert suggest/confirm/blocked and role enforcement. |
| R1-T03 | E2E | Add role-based flows: create case from chat, update from case view, audit lookup. | R1-U02, R1-U04 | Playwright e2e passes for tecnico/supervisor/admin paths. |
| R1-T04 | Visual+a11y | Add mobile/desktop visual and a11y checks on all new Release 1 surfaces. | R1-U02, R1-U04 | Visual and axe checks pass for loading/empty/error/success states. |
| R1-T05 | Staging gate | Run full extended regression and publish evidence artifacts. | R1-T01, R1-T02, R1-T03, R1-T04 | `npm run ci` + staging regression pass and request evidence is updated. |

## Dependency and Execution Order

Execution sequence:
1. Contracts baseline: `R1-C01 -> R1-C02`.
2. Runtime integration: `R1-C03 + R1-C04 + R1-C05`.
3. Governance wiring: `R1-A01 -> R1-A02` and `R1-U01`.
4. User flows: `R1-U02 -> R1-U03 -> R1-U04`.
5. Quality closure: `R1-T01 -> R1-T02 -> R1-T03 -> R1-T04 -> R1-T05`.

Parallelization rules:
- `R1-C03`, `R1-C04`, and `R1-C05` can run in parallel after `R1-C02`.
- `R1-T01` can start as soon as `R1-C01` is stable.
- `R1-A03` can run once `R1-U01` and baseline role tests are available.

## Release 1 Done Definition

Release 1 is done only when:

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
5. Rollback trigger and rollback steps documented for Release 1.

## External Tracker Export

- Ticketization package is now available in:
  - `docs/specs/opita-sync/tracker/external-ticketization-guide.md`
  - `docs/specs/opita-sync/tracker/release-1-ticket-export.csv`
