# Module 06. Gobierno de Herramientas

## Purpose

Govern tools that consult or mutate connected systems and define their risk, certification, environment posture, and execution mode.

## Scope

- Tool registry
- Certification and lifecycle state
- Risk classification
- Environment scoping
- Policy mode mapping
- Deprecation handling

## Primary Actors

- Operador Opita Code
- Supervisor
- Admin tenant

## Key Inputs and Outputs

- Inputs: tool metadata, risk class, environment, certification state, capability mapping
- Outputs: governed tool inventory, allowed execution modes, blocked execution decisions

## Core Flows

1. Register or review tool.
2. Classify risk and certification state.
3. Bind tool to capability and policy mode.
4. Expose allowed execution posture to orchestrated flows.
5. Block non-permitted execution attempts.

## Business Rules

- Sensitive writing tools cannot auto-execute without explicit classification.
- Not every tool may be available in production.
- Tool visibility differs between internal governance and tenant-facing views.
- Tools cannot replace capability-level governance.
- Tenant admins cannot certify tools or override policy ceilings; they may only consume certified capabilities and view scoped tool posture where exposed.

## Dependencies

- Module 05. Catalogo de Capacidades
- Module 09. Auditoria y Trazabilidad
- Module 12. Administracion Opita Code

## Acceptance Focus

- Tool registration with clear state
- Risk differentiation
- Policy mode enforcement
- Blocked execution when certification or environment does not permit use

## Open Gaps

- None at product-spec level. Split governance is fixed.
