# Domain Contract

## Purpose
Own the canonical domain model and invariants for Opita Sync.

## Must define
- tenant, environment, user, role, relationship, system identity
- policy, classification, action, workflow, publication
- execution contract, execution plan, run, approval, output artifact, release decision

## Must not do
- framework IO
- connector calls
- provider calls
- policy evaluation side effects

## Invariants
- governance outranks convenience
- visibility/use/draft/apply/send stay distinct
- published semantic meaning is immutable
