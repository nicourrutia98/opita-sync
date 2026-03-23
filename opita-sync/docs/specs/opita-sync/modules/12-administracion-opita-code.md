# Module 12. Administracion Opita Code

## Purpose

Provide the global governance surface for product approval, certification, deployment, rollback, and operational support.

## Scope

- Capability approval
- Tool approval
- Deployment and rollback control
- Operational support posture
- Product evolution governance

## Primary Actors

- Operador Opita Code

## Key Inputs and Outputs

- Inputs: capability proposal, tool certification state, deployment state, rollback request
- Outputs: approved or rejected governance decisions, deployment posture, rollback execution record

## Core Flows

1. Review governed product changes.
2. Approve or reject capabilities and tools.
3. Manage deployment state.
4. Trigger rollback or operational support actions.

## Business Rules

- Opita Code retains operational responsibility in the current phase.
- Control is not fully delegated to tenants.
- Product governance is part of the service itself.

## Dependencies

- Module 05. Catalogo de Capacidades
- Module 06. Gobierno de Herramientas
- Module 09. Auditoria y Trazabilidad

## Acceptance Focus

- Approval and deployment management
- Global visibility of capability and tool state
- Rollback readiness

## Open Gaps

- Customer-visible versus internal governance surface boundary
