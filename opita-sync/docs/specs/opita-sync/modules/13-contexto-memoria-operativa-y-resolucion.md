# Module 13. Contexto, Memoria Operativa y Resolucion

## Purpose

Reconstruct the correct context for each request without relying on free model memory as the source of truth.

## Scope

- Request identity
- Product-rule layer
- Tenant layer
- User and role layer
- Case and entity layer
- Derived summary
- Recent relevant messages
- Current request

## Primary Actors

- System-level cross-cutting module consumed by all operational actors

## Key Inputs and Outputs

- Inputs: request identity, tenant data, actor data, case context, recent message slice, product rules
- Outputs: minimum correct context package used for resolution and audit

## Core Flows

1. Resolve request identity and actor scope.
2. Pull only relevant tenant, role, case, and recent-message context.
3. Build derived summary for decisioning.
4. Expose context package to orchestrated modules and audit.

## Business Rules

- The model is not the source of truth for context.
- Full histories must not be sent when they add no value.
- All context resolution must be permission-filtered.
- Every contextualized call must be auditable.

## Dependencies

- Module 08. Roles, Accesos y Visibilidad
- Module 02. Casos y Solicitudes
- Module 09. Auditoria y Trazabilidad
- Module 01. Chat / Orchestrator

## Acceptance Focus

- Minimal correct context
- No tenant mixing
- Relevant retrieval only
- Explainable context inputs behind decisions

## Open Gaps

- Final strategy for summarization and pruning
