# Module 14. Compliance, Datos y Retencion

## Purpose

Align product behavior with data restrictions, retention, reuse, anonymization, and regulatory expectations.

## Scope

- Retention policy
- Reuse opt-in policy
- Anonymization and de-identification
- Colombian compliance posture
- Tenant segregation
- Data minimization

## Primary Actors

- Cross-cutting governance module with stakeholder-specific visibility

## Key Inputs and Outputs

- Inputs: data class, tenant scope, retention rule, reuse consent state, deletion request
- Outputs: governed retention posture, reuse decision, compliance evidence

## Core Flows

1. Classify operational data and tenant scope.
2. Apply default no-reuse policy.
3. Require traceable opt-in and de-identification before reuse.
4. Enforce retention and segregation rules.

## Business Rules

- Reuse for improvement is off by default.
- Any reuse requires traceability plus anonymization or de-identification first.
- Operational memory cannot automatically become a training dataset.
- Product default retention is 24 months for case and audit records, 12 months for conversational working-memory summaries, and immediate logical unlinking for reusable AI memory when a tenant is offboarded, unless contract or law requires a different period.

## Dependencies

- Module 09. Auditoria y Trazabilidad
- Module 11. Billing y Consumo
- Module 13. Contexto, Memoria Operativa y Resolucion
- Module 12. Administracion Opita Code

## Acceptance Focus

- Tenant data segregation
- Visible reuse policy
- Governed retention
- Audit support for compliance review

## Open Gaps

- Contract-specific and law-specific overrides only.
