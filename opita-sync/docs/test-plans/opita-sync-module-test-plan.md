# Opita Sync Module Test Plan

## Strategy

Validate the product incrementally by module and release, starting with the cheapest reliable checks and preserving evidence for loading, empty, error, and success states where UI work exists.

This module plan is complemented by `docs/test-plans/opita-sync-integration-and-regression-plan.md`, which defines the mandatory release gate package and staging regression expectations.

## Module Coverage

| Module | Primary Checks | Evidence Type |
| --- | --- | --- |
| 01. Chat / Orchestrator | Intent classification, clarification path, suggest versus confirm behavior, audit creation | Unit, integration, audit fixtures |
| 02. Casos y Solicitudes | Case creation, visibility filters, state transitions, escalation, closure | Unit, integration, role matrix scenarios |
| 03. Bitacora Operativa | Log creation, evidence visibility, before/after capture, edit restrictions | Unit, integration |
| 04. Borradores y Comunicacion Asistida | Draft generation, template application, approval branch, blocked usage | Unit, integration, UX review |
| 05. Catalogo de Capacidades | Tenant-scoped catalog visibility, activation states, capability-to-policy mapping | Unit, integration |
| 06. Gobierno de Herramientas | Tool registration, risk classification, certification state, execution blocking | Unit, integration, audit review |
| 07. Parametrizacion del Tenant | Allowed config changes, tenant isolation, global guardrail enforcement | Unit, integration |
| 08. Roles, Accesos y Visibilidad | Role matrix enforcement, entity masking, unauthorized action blocking | Unit, integration, security review |
| 09. Auditoria y Trazabilidad | Event completeness, query filters, suggest-confirm-execute differentiation | Unit, integration |
| 10. Reporting de Valor y Adopcion | Metric aggregation, period slicing, audience-specific views | Unit, integration, data verification |
| 11. Billing y Consumo | Tenant attribution, success-only billing baseline, included versus additional separation | Unit, integration, finance review |
| 12. Administracion Opita Code | Approval flows, deployment state, rollback command path | Integration, operational drills |
| 13. Contexto, Memoria Operativa y Resolucion | Relevant context retrieval, tenant isolation, pruning, explainability | Unit, integration, audit review |
| 14. Compliance, Datos y Retencion | Segregation, retention rule application, reuse opt-in enforcement | Unit, integration, compliance review |
| 15. Navegacion, UX global y experiencia multiplataforma | Navigation by role, continuity between surfaces, loading-empty-error-success states, responsive behavior | E2E, visual, a11y review |

## Release Validation Sequence

1. Release 1: modules 13, 08, 02, 01, 09.
2. Release 2: modules 03, 05, 06, 07.
3. Release 3: modules 04, 10, 11.
4. Release 4: modules 12, 14, 15.

## UX Evidence Requirements

- For any implemented user-facing module, capture loading, empty, error, and success evidence.
- For navigation work, validate primary completion paths on mobile first for solicitante, tecnico, and supervisor, and validate web-first backoffice paths for admin tenant and Opita Code.
- For audit-heavy actions, verify the user-visible outcome and the underlying event trail.
