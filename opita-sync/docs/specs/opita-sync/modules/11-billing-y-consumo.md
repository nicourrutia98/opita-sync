# Module 11. Billing y Consumo

## Purpose

Measure and attribute service consumption by tenant to support external billing and commercial follow-up outside the platform.

## Scope

- AI consumption attribution
- Activity logging
- Positive action counting
- Commercial follow-up support
- Internal cost control basis
- Exportable usage evidence for external invoicing

## Primary Actors

- Operador Opita Code
- Sponsor
- Admin tenant

## Key Inputs and Outputs

- Inputs: successful usage events, tenant scope, capability usage, model/provider context
- Outputs: tenant-attributed consumption records, external billing classifications, commercial tracking views, and exportable usage evidence

## Core Flows

1. Receive attributable action from upstream module.
2. Attach tenant, capability, and outcome metadata.
3. Classify the event according to the external commercial model.
4. Expose summarized consumption views and exportable evidence.

## Business Rules

- The client provides provider and model in the described baseline.
- Consumption must be attributable by tenant.
- Failed baseline actions are not billed initially.
- Included and additional boundaries must be explicit.
- Invoices, collections, and price presentation are out of platform scope.
- The platform records evidence for later invoicing, but does not become a billing UI.

## Dependencies

- Module 01. Chat / Orchestrator
- Module 04. Borradores y Comunicacion Asistida
- Module 09. Auditoria y Trazabilidad
- Module 10. Reporting de Valor y Adopcion

## Acceptance Focus

- Tenant-level attribution
- Registration of successful actions
- Included versus additional separation

## Open Gaps

- None at product-spec level. Billing stays external; only metering and export remain in scope.
