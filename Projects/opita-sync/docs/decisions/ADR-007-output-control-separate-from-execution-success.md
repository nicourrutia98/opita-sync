# ADR-007 ? Output control separate from execution success

## Status
Accepted

## Context
Successful execution can still produce output that must not be disclosed.

## Decision
Release decision is separate from execution completion.

## Consequences
- execution_completed != released
- mixed-authority output blocks by default
- redaction and escalation are governed primary flows

## Execution impact
Output-control is a first-class package and phase, not a postprocessing convenience step.
