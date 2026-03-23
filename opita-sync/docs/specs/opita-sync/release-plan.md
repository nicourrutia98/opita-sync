# Opita Sync Release Plan

## Release 0. Design Baseline

- Publish modular overview, module specs, transversal matrices, and test plan.
- Exit criteria: documentation package complete and validated.

## Release 1. Operational Core

### Modules

- 13. Contexto, Memoria Operativa y Resolucion
- 08. Roles, Accesos y Visibilidad
- 02. Casos y Solicitudes
- 01. Chat / Orchestrator
- 09. Auditoria y Trazabilidad

### Goal

Enable tenant-scoped case creation, governed conversational resolution, and auditable operational flow.

### Gates

- Confirm baseline permission matrix.
- Confirm audit event taxonomy draft is acceptable.
- Confirm mobile design system and offline/poor-connectivity behavior for operational roles.

## Release 2. Operational Depth

### Modules

- 03. Bitacora Operativa
- 05. Catalogo de Capacidades
- 06. Gobierno de Herramientas
- 07. Parametrizacion del Tenant

### Goal

Introduce governed operational updates, capability management, tool control, and tenant configuration.

### Gates

- Define evidence taxonomy baseline.
- Confirm tenant admin surfaces against the fixed split-governance model.

## Release 3. Assisted Work and Value Visibility

### Modules

- 04. Borradores y Comunicacion Asistida
- 10. Reporting de Valor y Adopcion
- 11. Billing y Consumo

### Goal

Add assisted drafting, value measurement, and tenant-attributed usage visibility.

### Gates

- Confirm external billing export format and financial handoff process.

## Release 4. Governance and Compliance Expansion

### Modules

- 12. Administracion Opita Code
- 14. Compliance, Datos y Retencion
- 15. Navegacion, UX global y experiencia multiplataforma

### Goal

Complete global governance, compliance posture, and multiplatform experience refinement.

### Gates

- Finalize retention and deletion operating model.
- Confirm customer-visible versus internal governance surfaces.

## Dependency Notes

- Module 13 is upstream of all context-sensitive AI behavior.
- Module 08 is upstream of visibility, action control, and safe retrieval.
- Module 09 must be implemented early enough to avoid untraceable operational behavior.
- Modules 10 and 11 depend on reliable audit and case events.
- Module 15 should validate, not obscure, prior module responsibilities.

## Execution Baseline

- Use `docs/specs/opita-sync/integration-master-plan.md` as the release integration source of truth.
- Use `docs/test-plans/opita-sync-integration-and-regression-plan.md` for release exit gating and regression evidence.
- Use `docs/specs/opita-sync/release-1-execution-board.md` as the actionable backlog for Release 1.
- Use `docs/specs/opita-sync/release-2-execution-board.md` as the actionable backlog for Release 2.
- Use `docs/specs/opita-sync/release-3-execution-board.md` as the actionable backlog for Release 3.
- Use `docs/specs/opita-sync/release-4-execution-board.md` as the actionable backlog for Release 4.
- Use `docs/specs/opita-sync/tracker/external-ticketization-guide.md` and release CSV exports for tracker import.
