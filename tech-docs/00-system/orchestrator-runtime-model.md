---
id: tech-orchestrator-runtime-model
title: Orchestrator Runtime Model
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: phase-3
related_docs:
  - ./system-architecture.md
  - ../../docs/02-reference/orchestrator-operating-model.md
  - ../01-tools/tool-registry-spec.md
  - ../01-tools/action-policy-engine.spec.md
---

# Orchestrator Runtime Model

## Purpose

Define the technical runtime model required to implement the governed orchestrator described in the approved business docs.

## Runtime stages

1. receive authenticated request
2. resolve tenant, actor, role, and permissions
3. interpret user intent
4. resolve governed capability
5. resolve candidate tools and versions
6. evaluate action policy
7. build execution context
8. call model provider when required
9. choose one of:
   - `suggest`
   - `confirm_then_execute`
   - `auto_execute`
   - `blocked`
10. record audit trail and technical traces
11. emit `positive_action` only when execution qualifies

## Runtime components

- `intent_resolver`
- `capability_router`
- `tool_registry`
- `action_policy_engine`
- `context_builder`
- `capability_runtime`
- `tool_executor`
- `audit_service`
- `llm_trace_service`
- `positive_action_recorder`

## Execution states

- `suggested`
- `confirmation_requested`
- `executed_success`
- `executed_failed`
- `blocked`

## Confirmation boundary

- confirmation is evaluated after tool resolution and before mutating execution
- `read_only` tools do not require confirmation by default
- `write_with_confirmation` tools require explicit confirmation
- `auto_executable_low_risk` tools may skip confirmation only when tenant policy allows it

## Positive action boundary

`positive_action` is emitted only when:

- a governed tool executed successfully
- no error occurred
- the execution result is recorded
- the action belongs to a known capability and tenant scope
