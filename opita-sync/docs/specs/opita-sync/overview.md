# Opita Sync Modular Overview

## Objective

Provide a repository-native baseline for Opita Sync design so future implementation requests can work from stable module contracts instead of conversational reinterpretation.

## Module Map

### Core Product

1. Chat / Orchestrator
2. Casos y Solicitudes
3. Bitacora Operativa
4. Borradores y Comunicacion Asistida

### Governance and Platform

5. Catalogo de Capacidades
6. Gobierno de Herramientas
7. Parametrizacion del Tenant
8. Roles, Accesos y Visibilidad
9. Auditoria y Trazabilidad

### Business and Operations

10. Reporting de Valor y Adopcion
11. Billing y Consumo
12. Administracion Opita Code

### Cross-Cutting

13. Contexto, Memoria Operativa y Resolucion
14. Compliance, Datos y Retencion
15. Navegacion, UX global y experiencia multiplataforma

## Recommended Implementation Order

1. Contexto, Memoria Operativa y Resolucion
2. Roles, Accesos y Visibilidad
3. Casos y Solicitudes
4. Chat / Orchestrator
5. Bitacora Operativa
6. Auditoria y Trazabilidad
7. Catalogo de Capacidades
8. Gobierno de Herramientas
9. Parametrizacion del Tenant
10. Borradores y Comunicacion Asistida
11. Reporting de Valor y Adopcion
12. Billing y Consumo
13. Administracion Opita Code
14. Compliance, Datos y Retencion
15. Navegacion, UX global y experiencia multiplataforma

## Design Principles

- The model never acts as the system of record.
- Every operational action must resolve through capability, tool, permission, and policy mode.
- Tenant customization is allowed only inside governed boundaries.
- Auditability is mandatory for significant decisions and mutations.
- Chat is an entry surface, not the entire product.
- Operational execution is mobile-first for field and frontline roles.
- Billing is external to the platform; the product only records attributable usage and value evidence.

## Derived Artifacts

- `docs/specs/opita-sync/modules/` contains one file per module.
- `docs/specs/opita-sync/transversal/` contains cross-cutting matrices.
- `docs/specs/opita-sync/release-plan.md` maps modules into staged releases.
- `docs/test-plans/opita-sync-module-test-plan.md` defines validation coverage.

## Fixed Product Decisions

- Mobile-first for solicitante, tecnico, and supervisor; web-first for admin tenant and Opita Code.
- Split governance: tenant admins configure approved libraries and certified capabilities only; Opita Code retains product and tool governance.
- Billing and invoicing remain outside the platform.
- The platform stores attributable usage, value events, and exportable evidence for external commercial operations.
