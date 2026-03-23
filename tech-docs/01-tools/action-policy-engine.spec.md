---
id: tech-action-policy-engine
title: Action Policy Engine Specification
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: phase-3
related_docs:
  - ./tool-registry-spec.md
  - ../../docs/02-reference/orchestrator-operating-model.md
  - ../../docs/02-reference/capability-governance.md
---

# Action Policy Engine Specification

## Purpose

Define how the orchestrator decides suggestion, confirmation, auto-execution, or block.

## Inputs

```yaml
tenant_id: string
user_id: string
role: string
capability_code: string
tool_code: string
tool_version: string
risk_level: read_only | draft_only | write_with_confirmation | auto_executable_low_risk
context_completeness: sufficient | partial | insufficient
action_sensitivity: low | medium | high
tenant_policy_flags: object
```

## Outputs

```yaml
decision: suggest | confirm_then_execute | auto_execute | blocked
confirmation_required: boolean
block_reason: string?
```

## Default rules

- `read_only` -> `suggest`
- `draft_only` -> `suggest`
- `write_with_confirmation` -> `confirm_then_execute`
- `auto_executable_low_risk` -> `auto_execute` only when tenant policy explicitly allows it
- insufficient context for sensitive action -> `blocked`
- missing permission -> `blocked`
