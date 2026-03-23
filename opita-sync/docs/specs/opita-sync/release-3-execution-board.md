# Opita Sync Release 3 Execution Board

## Release Scope

Release 3 modules:
- 04. Borradores y Comunicacion Asistida
- 10. Reporting de Valor y Adopcion
- 11. Billing y Consumo

Release objective:
- Enable assisted drafting, value/adoption visibility, and tenant-attributed usage export for external billing handoff.

## Workstreams and Tickets

### Contracts and API Integration

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R3-C01 | Contracts | Define and version `DraftRequestDto` and `DraftResponseDto` for assisted drafting. | None | Draft contract supports approval-required and audit metadata fields. |
| R3-C02 | Contracts | Define and version `ValueReportDto` and `ValueMetricDto` for reporting surfaces. | None | Reporting contract supports period and role-based slices. |
| R3-C03 | Contracts | Define and version `UsageAttributionDto` and `BillingExportDto`. | None | Usage attribution and export payloads are stable and documented. |
| R3-C04 | Integration | Connect draft/reporting/usage endpoints through typed remote adapters. | R3-C01, R3-C02, R3-C03 | Release 3 read/write/export flows run through `OpitaAppServices` adapters. |

### UI and Runtime Behavior

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R3-U01 | UI | Implement assisted-draft generation flow in chat with audit feedback. | R3-C01, R3-C04 | Draft generation works with loading/error/success and audit trace. |
| R3-U02 | UI | Implement value/adoption reporting block in home by role. | R3-C02, R3-C04 | Home exposes period and metric cards with fallback states. |
| R3-U03 | UI | Implement usage attribution and external billing export controls in admin config. | R3-C03, R3-C04 | Admin can view usage and trigger export with clear result state. |

### Test and Quality Gates

| Ticket | Workstream | Description | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| R3-T01 | Contract tests | Validate schema compatibility for draft/reporting/usage DTOs. | R3-C01, R3-C02, R3-C03 | Contract checks pass in CI. |
| R3-T02 | E2E | Validate chat draft generation, value reporting visibility, and billing export. | R3-U01, R3-U02, R3-U03 | Playwright flow suite passes for mobile-first and admin surfaces. |
| R3-T03 | Visual+a11y | Keep visual and a11y baseline green after Release 3 additions. | R3-U01, R3-U02, R3-U03 | Visual and a11y suites pass in CI. |

## Done Definition

Release 3 is done only when:
1. `npm run ci` is green.
2. Draft/reporting/usage flows pass e2e with evidence.
3. Active request evidence is updated (`validation-log.md`, `compliance-matrix.md`, `residual-risk-summary.md`).

## External Tracker Export

- Ticketization package is now available in:
  - `docs/specs/opita-sync/tracker/external-ticketization-guide.md`
  - `docs/specs/opita-sync/tracker/release-3-ticket-export.csv`
