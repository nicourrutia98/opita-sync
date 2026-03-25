# Contracts Package Contract

## Purpose
Own canonical execution contract schemas, revisions, normalization DTOs, and admissibility input/output contracts.

## Inputs
- interpreted intent
- user constraints
- system defaults
- governance constraints

## Outputs
- execution contract
- contract revision
- contract diff
- admissibility request envelope

## Rules
- no execution without contract
- governance-relevant mutation requires re-evaluation
