# Module 07. Parametrizacion del Tenant

## Purpose

Allow each tenant to adapt visible and operational product behavior within a governed baseline.

## Scope

- Case fields, categories, priorities, and visible states
- Templates
- Approved policies
- UX and reporting options inside allowed limits

## Primary Actors

- Admin tenant
- Operador Opita Code

## Key Inputs and Outputs

- Inputs: tenant configuration change, allowed option library, actor role
- Outputs: tenant-specific parameters, audited configuration history, enforced global limits

## Core Flows

1. Admin reviews configurable options.
2. Updates allowed parameters.
3. System validates change against global guardrails.
4. Applies tenant-specific configuration and records audit.

## Business Rules

- This phase allows configuration only from a closed option library.
- Arbitrary logic or custom integrations are out of baseline scope.
- Requests for new logic exit baseline and become governed change requests.
- Tenant admins may activate pre-certified capabilities and edit approved labels, templates, categories, and visibility rules, but cannot publish new capabilities or change global policy ceilings.

## Dependencies

- Module 08. Roles, Accesos y Visibilidad
- Module 02. Casos y Solicitudes
- Module 04. Borradores y Comunicacion Asistida
- Module 10. Reporting de Valor y Adopcion
- Module 09. Auditoria y Trazabilidad

## Acceptance Focus

- Tenant-local configuration changes
- Audit of configuration operations
- Enforcement of global limits

## Open Gaps

- None at product-spec level. Self-service is limited to approved libraries and certified capability toggles.
