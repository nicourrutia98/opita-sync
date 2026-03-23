# Module 05. Catalogo de Capacidades

## Purpose

Define and expose product capabilities as the governed functional contracts that connect intent, policy, tools, and success criteria.

## Scope

- Capability registry
- Capability metadata
- Enablement state per tenant
- Requirements and restrictions
- Mapping to tools and policy modes

## Primary Actors

- Admin tenant
- Operador Opita Code

## Key Inputs and Outputs

- Inputs: capability definition, enablement state, tenant scope, policy mapping
- Outputs: visible capability catalog, active/inactive status, restrictions, linked tool set

## Core Flows

1. View available capabilities by tenant.
2. Review requirements and restrictions.
3. Enable or disable supported capabilities within allowed boundaries.
4. Expose policy mode and tool links to downstream modules.

## Business Rules

- A capability is a functional contract, not a synonym for a tool.
- Every capability includes actor scope, required data, and success criteria.
- Publication of new capabilities is centrally governed.

## Dependencies

- Module 06. Gobierno de Herramientas
- Module 07. Parametrizacion del Tenant
- Module 12. Administracion Opita Code

## Acceptance Focus

- Tenant-scoped capability visibility
- Active versus inactive state clarity
- Mapping to tools and policy modes

## Open Gaps

- Final self-service depth for tenant enablement
