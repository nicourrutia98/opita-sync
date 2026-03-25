# ADR-010 ? Provider-agnostic governance

## Status
Accepted

## Context
OpenAI, Anthropic, and Gemini are configurable providers, but governance must not depend on vendor-specific behavior.

## Decision
Provider adapters remain subordinate to contracts, policy, runtime, and output-control.

## Consequences
- providers can support interpretation/planning tasks
- providers cannot own authorization, publication, approval, or release semantics

## Execution impact
Provider adapters are a later implementation phase, after the canonical governance substrate exists.
