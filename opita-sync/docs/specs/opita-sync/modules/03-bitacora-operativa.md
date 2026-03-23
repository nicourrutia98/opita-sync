# Module 03. Bitacora Operativa

## Purpose

Record operational progress, evidence, comments, and before/after events linked to a case.

## Scope

- Log entries
- Evidence attachments
- Operational comments
- Chronological history
- Governed edits

## Primary Actors

- Tecnico
- Supervisor

## Key Inputs and Outputs

- Inputs: case identifier, entry content, evidence metadata, before/after change set
- Outputs: persisted log entry, updated case timeline, auditable change record

## Core Flows

1. Authorized user submits progress update.
2. System validates role, format, and visibility.
3. Persist log entry and evidence metadata.
4. Reflect operational impact on case history.

## Business Rules

- Every log entry belongs to one case.
- Sensitive changes require explicit before/after capture.
- Post-creation edits are policy-governed.
- Evidence visibility may differ by role.

## Data and State Concerns

- Entries must separate informal notes from operationally material events.
- Evidence taxonomy baseline is fixed to image, PDF, document export, structured link, and structured before/after snapshot.

## Dependencies

- Module 02. Casos y Solicitudes
- Module 08. Roles, Accesos y Visibilidad
- Module 09. Auditoria y Trazabilidad

## Acceptance Focus

- Successful progress logging
- Ordered chronology
- Traceable author, date, and effect
- Restricted editability

## Open Gaps

- Advanced attachment transport and storage implementation only.
