# Opita Sync Release 4 Execution Board

## Release Scope

Release 4 modules:
- 12. Administracion Opita Code
- 14. Compliance, Datos y Retencion
- 15. Navegacion, UX global y experiencia multiplataforma

Release objective:
- Close governance/compliance runtime capabilities and role-driven navigation continuity for production-ready operations.

## Workstreams and Tickets

### Contracts and API Integration

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R4-C01 | Contracts | Define `GlobalGovernanceStateDto` and governance action request/response DTOs. | None | Governance contract supports approve/deploy/rollback actions with audit IDs. |
| R4-C02 | Contracts | Define `RetentionPolicyDto` and `DataReuseConsentDto` with update contract. | None | Compliance contract supports retention visibility and explicit consent toggling. |
| R4-C03 | Contracts | Define `NavigationManifestDto` by role. | None | Navigation contract supports primary/backoffice surfaces by role. |
| R4-C04 | Integration | Connect governance/compliance/navigation endpoints via typed adapters. | R4-C01, R4-C02, R4-C03 | Release 4 flows run through `OpitaAppServices` without direct fixture imports. |

### UI and Runtime Behavior

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R4-U01 | UI | Implement global governance panel with action controls and status feedback. | R4-C01, R4-C04 | Admin can execute actions and see correlated audit outcomes. |
| R4-U02 | UI | Implement compliance panel for retention policy and data-reuse consent updates. | R4-C02, R4-C04 | Admin can consult policy and toggle consent with visible trail. |
| R4-U03 | UI | Implement role navigation manifesto visibility in app runtime. | R4-C03, R4-C04 | Runtime surfaces show role-specific primary/backoffice manifests. |

### Test and Quality Gates

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R4-T01 | Contract tests | Validate governance/compliance/navigation DTO compatibility. | R4-C01, R4-C02, R4-C03 | Contract coverage passes in CI. |
| R4-T02 | E2E | Validate governance action flow, consent update flow, and navigation manifesto visibility. | R4-U01, R4-U02, R4-U03 | Release 4 e2e scenarios pass in CI. |
| R4-T03 | Visual+a11y | Keep responsive and accessibility gates green after Release 4 additions. | R4-U01, R4-U02, R4-U03 | Visual and a11y suites pass in CI. |

## Done Definition

Release 4 is done only when:
1. `npm run ci` is green.
2. Governance/compliance/navigation e2e flows pass with traceable evidence.
3. Active request evidence is updated (`validation-log.md`, `compliance-matrix.md`, `residual-risk-summary.md`).

## External Tracker Export

- Ticketization package is now available in:
  - `docs/specs/opita-sync/tracker/external-ticketization-guide.md`
  - `docs/specs/opita-sync/tracker/release-4-ticket-export.csv`
