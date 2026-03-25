# ADR-003 ? Policy validation before execution compilation

## Status
Accepted

## Context
Compiling plans before validating authority, classification, and publication risks generating ungoverned execution paths.

## Decision
Admissibility must complete before execution compilation starts.

## Consequences
- plan compiler consumes admissible contract + restrictions
- denied or approval-required outcomes stop or pause before compilation/execution
- capability selection can only choose allowed approved assets

## Execution impact
Authority, policy-engine, classification, and catalog metadata must exist before production-grade plan compilation.
