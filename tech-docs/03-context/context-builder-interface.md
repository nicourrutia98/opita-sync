---
id: tech-context-builder-interface
title: Context Builder Interface
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-2
related_docs:
  - ./context-builder-contract.md
  - ../02-data/data-model-phase-2.md
  - ../../docs/02-reference/context-and-memory-management.md
---

# Context Builder Interface

## Purpose

Freeze the phase-2 service contract for building model-ready context.

## Input contract

```yaml
tenant_id: string
user_id: string
role: requester | technician | supervisor | tenant-admin
conversation_id: string
capability_code: request_create | status_query | operational_logbook | draft_generation
intent_code: string?
tool_code: string?
tool_version: string?
risk_level: read_only | draft_only | write_with_confirmation | auto_executable_low_risk ?
execution_mode: suggest | confirm_then_execute | auto_execute ?
case_id: string?
entity_id: string?
current_user_request: string
```

## Output contract

```yaml
product_rules: string[]
tenant_rules: string[]
user_permissions: string[]
case_state: object
retrieved_context:
  documents: object[]
  records: object[]
  summaries: object[]
recent_messages: object[]
candidate_tools: object[]
policy_inputs: object
recommended_execution_mode: string?
confirmation_required: boolean
open_questions: string[]
blocked: boolean
block_reason: string?
```

## Retrieval order

1. validate tenant and user
2. resolve role permissions
3. load tenant rules and templates
4. load active case state when present
5. load latest conversation summary
6. load recent messages
7. load capability-specific records
8. load candidate tools and policy inputs when available
9. emit final context contract

## Capability-specific retrieval

### `request_create`

- form schema
- assignment rules
- allowed categories
- required fields

### `status_query`

- case header
- latest visible updates
- role visibility rules

### `operational_logbook`

- active case state
- allowed evidence types
- update validation rules

### `draft_generation`

- case summary
- tenant template
- output constraints

## Failure rules

- if tenant resolution fails: block
- if role permission fails: block
- if required case is missing: block
- if context is incomplete but non-sensitive: ask clarification
- if context is incomplete and action is sensitive: block
