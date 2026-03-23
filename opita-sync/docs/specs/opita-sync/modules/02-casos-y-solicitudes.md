# Module 02. Casos y Solicitudes

## Purpose

Manage the operational lifecycle of requests and cases as the central business entity.

## Scope

- Case creation from chat or structured forms
- Classification and initial assignment
- Status lifecycle and escalation
- Case detail, timeline, and closure

## Primary Actors

- Solicitante
- Tecnico
- Supervisor
- Admin tenant

## Key Inputs and Outputs

- Inputs: case creation payload, assignment context, role-scoped filters, status transition command
- Outputs: unique case record, visible state, assignment state, escalation state, closure outcome

## Core Flows

1. Create request or case.
2. Assign initial owner or queue.
3. Expose visible status and details according to role.
4. Execute authorized state transition, escalation, block, or closure.
5. Persist timeline and linked evidence.

## Business Rules

- Every case belongs to exactly one tenant.
- Case visibility depends on role and entity scope.
- Relevant transitions must be audited.
- Tenant-specific visible statuses may vary only within governed limits.

## Data and State Concerns

- Separate internal operational state from user-visible state when needed.
- Preserve history of responsible actor, escalation, and blockage reasons.

## Dependencies

- Module 08. Roles, Accesos y Visibilidad
- Module 07. Parametrizacion del Tenant
- Module 03. Bitacora Operativa
- Module 09. Auditoria y Trazabilidad

## Acceptance Focus

- Unique case identifiers
- Authorized case listing and retrieval
- Role-based state transitions
- Historical view with escalation and block events

## Open Gaps

- Final cross-domain taxonomy beyond maintenance scenarios
