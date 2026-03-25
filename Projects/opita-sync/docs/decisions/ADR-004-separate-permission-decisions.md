# ADR-004 ? Separate permission decisions

## Status
Accepted

## Context
Enterprise authority is not representable as flat RBAC or one boolean permission.

## Decision
The system keeps distinct decisions for:
- visibility
- usage
- data access
- draft generation
- apply authority
- send authority
- approval authority
- delegation authority

## Consequences
- authority model must remain explicit
- UI must surface different blocked states correctly
- policy explainability must reference which authority dimension failed

## Execution impact
Authority artifacts and policy evaluation schemas must encode these dimensions from the first implementation slice.
