# Module 09. Auditoria y Trazabilidad

## Purpose

Record every significant system action and make operational decisions explainable across product, support, and compliance use cases.

## Scope

- Request-level audit
- Action-level audit
- Before/after snapshots
- Actor, tenant, capability, tool, policy, and result capture
- Query surfaces for case, actor, tenant, and time

## Primary Actors

- All actors with scoped views
- Operador Opita Code with full view
- Sponsor with summarized view

## Key Inputs and Outputs

- Inputs: significant action metadata, context snapshot, policy mode, result, failure or block reason
- Outputs: audit trail records and queryable timeline views

## Core Flows

1. Receive event from upstream module.
2. Normalize actor, tenant, capability, tool, and policy metadata.
3. Persist result and reasons.
4. Expose audit queries with role-aware visibility.

## Business Rules

- Every relevant action leaves a trail.
- Sensitive mutations require explainability.
- Audit must support operations, compliance, and support, not just analytics.

## Dependencies

- All operational modules

## Acceptance Focus

- Query audit by case, actor, tenant, capability, and time
- Distinguish suggest, confirm, and execute outcomes
- Show result and reason for block or failure

## Open Gaps

- Final audit-query UX by user area
