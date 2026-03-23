# Opita Sync Integration Master Plan

## Objective

Close full product integration in 4 staged releases with contract-first delivery, strict role and tenant governance, and evidence-based quality gates.

## Integration Principles

- Contract-first is mandatory for every release increment.
- Runtime behavior is tenant-scoped and role-enforced by default.
- Mobile-first applies to solicitante, tecnico, and supervisor.
- Web-first applies to admin tenant and Opita Code governance surfaces.
- No module is considered done without UI and audit evidence.

## Release Sequence

### Release 1: Operational Core

Modules:
- 13. Contexto, Memoria Operativa y Resolucion
- 08. Roles, Accesos y Visibilidad
- 02. Casos y Solicitudes
- 01. Chat / Orchestrator
- 09. Auditoria y Trazabilidad

Technical integration outcomes:
- Versioned backend contracts for auth/session, cases, chat/orchestrator, and baseline audit events.
- Runtime tenant and role visibility enforcement across case and chat surfaces.
- End-to-end auditable trail for suggest, confirm, and execute paths.
- Normalized error mapping for 401, 403, 422, and 5xx families.

Functional gate:
- Case create/query/update works from both chat and structured views, with auditable evidence available per action.

Execution board:
- `docs/specs/opita-sync/release-1-execution-board.md`

### Release 2: Operational Depth

Modules:
- 03. Bitacora Operativa
- 05. Catalogo de Capacidades
- 06. Gobierno de Herramientas
- 07. Parametrizacion del Tenant

Technical integration outcomes:
- Operational log entries include evidence metadata and before/after where required.
- Capability catalog supports activation state by tenant.
- Tool governance applies risk classes and policy modes effectively.
- Tenant configuration remains constrained to approved configuration libraries.

Functional gate:
- Operational and tenant-governed mutations apply by role, remain within global guardrails, and are fully auditable.

Execution board:
- `docs/specs/opita-sync/release-2-execution-board.md`

### Release 3: Assisted Work and Value

Modules:
- 04. Borradores y Comunicacion Asistida
- 10. Reporting de Valor y Adopcion
- 11. Billing y Consumo

Technical integration outcomes:
- Assisted draft workflows support approval branches when policy requires.
- Reporting pipelines deliver capability and period slices by audience.
- Usage attribution exports support external billing handoff without internal invoicing logic.

Functional gate:
- Draft generation, value/adoption measurement, and commercial export are consistent per tenant and traceable to operations.

Execution board:
- `docs/specs/opita-sync/release-3-execution-board.md`

### Release 4: Governance, Compliance, and Experience Closure

Modules:
- 12. Administracion Opita Code
- 14. Compliance, Datos y Retencion
- 15. Navegacion, UX global y experiencia multiplataforma

Technical integration outcomes:
- Opita Code global governance supports approval, deployment state, and rollback operations.
- Retention, segregation, and controlled data reuse rules are enforceable and auditable.
- Final navigation and experience continuity are role-aligned across chat, cases, and backoffice surfaces.

Functional gate:
- Operation is explainable, compliant, and coherent across all user-visible and governance-critical surfaces.

Execution board:
- `docs/specs/opita-sync/release-4-execution-board.md`

## Stable Interface Rules

- `OpitaAppServices` remains the single runtime consumption contract for frontend modules.
- Separation is required and non-negotiable:
  - `src/domain` for stable domain types,
  - `src/services/api` for transport DTOs,
  - `src/services/view-models` for UI mapping.
- Error strategy remains uniform:
  - 401 invalidates session and returns to login,
  - 403 keeps session and shows access denied,
  - 422 exposes actionable field or workflow feedback.
- `stub` is allowed for dev/Storybook and controlled QA only; release closure requires remote staging evidence.

## Release Exit Gates

Every release must pass all gates:

1. `npm run ci` in green.
2. Extended staging regression in green:
   - e2e flows by key roles,
   - visual checks on new or modified surfaces,
   - a11y checks for login/shell plus release surfaces,
   - remote contract smoke tests.
3. Active request evidence updated:
   - `validation-log.md`
   - `compliance-matrix.md`
   - `residual-risk-summary.md`
4. Rollback criterion documented for the release increment.
