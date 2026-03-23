# Module 04. Borradores y Comunicacion Asistida

## Purpose

Help operational users generate contextual, templated drafts for follow-up and communication without triggering automatic sending.

## Scope

- Draft generation from case context
- Template application
- Tenant tone and formatting
- Approval routing when required
- Attributable consumption logging

## Primary Actors

- Tecnico
- Supervisor
- Admin tenant

## Key Inputs and Outputs

- Inputs: case context, communication intent, tenant template, role, approval policy
- Outputs: draft text, approval requirement, usage record, audit event

## Core Flows

1. User requests draft.
2. System gathers case and tenant context.
3. Apply template and policy restrictions.
4. Generate draft.
5. Deliver for editing or route to approval.

## Business Rules

- Draft generation never implies automatic sending.
- Tenant templates operate inside governed structure.
- Usage may be restricted by role or workflow stage.
- Consumption must be attributable by tenant and action.
- Drafts marked as external-critical, contractual, regulatory, or executive require supervisor approval before use; routine operational drafts do not.

## Dependencies

- Module 02. Casos y Solicitudes
- Module 07. Parametrizacion del Tenant
- Module 08. Roles, Accesos y Visibilidad
- Module 09. Auditoria y Trazabilidad
- Module 11. Billing y Consumo

## Acceptance Focus

- Context-aware draft generation
- Respect for tenant template and tone
- Audit and consumption capture
- Correct blocking when use is disallowed

## Open Gaps

- Outbound-channel implementation only. Approval policy is fixed by communication criticality.
