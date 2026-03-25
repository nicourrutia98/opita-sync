# ADR-001 ? Governed execution, not free agent loop

## Status
Accepted

## Context
Opita Sync is a governed execution platform, not a generic chatbot or unconstrained agent framework.

## Decision
All execution must follow the canonical flow:

intent -> contract -> policy validation -> execution compilation -> durable execution -> output control

## Consequences
- no direct tool calling from chat
- no opaque autonomous agent loop as system core
- no execution without explicit contract and policy boundary
- orchestrator remains subordinate to governance and runtime semantics

## Execution impact
Implementation must start from domain/contracts/policy/runtime/output-control, not from chat UX or provider SDK wiring.
