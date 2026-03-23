---
id: tech-tool-registry-spec
title: Tool Registry Specification
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: phase-3
related_docs:
  - ../../docs/02-reference/orchestrator-operating-model.md
  - ../../docs/02-reference/capability-governance.md
  - ../00-system/orchestrator-runtime-model.md
---

# Tool Registry Specification

## Purpose

Define the minimum governed contract for technical tools under the orchestrator.

## Required fields

```yaml
tool_code: string
tool_version: string
capability_code: string
tool_type: string
risk_level: read_only | draft_only | write_with_confirmation | auto_executable_low_risk
execution_mode: suggest | confirm_then_execute | auto_execute
certification_status: draft | reviewed | certified | production | deprecated
tenant_scope_mode: shared_standard | tenant_parameterized | tenant_specific
permissions_required: string[]
requires_provider: boolean
rollback_strategy: string
input_contract_ref: string
output_contract_ref: string
```

## Rules

- every tool belongs to one governed capability
- every tool must be versioned
- every tool must expose risk and certification state
- mutating tools must define rollback posture
- deprecated tools must not be selected for new execution paths
