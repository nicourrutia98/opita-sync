---
id: tech-context-builder-contract
title: Context Builder Contract
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-1
related_docs:
  - ../../docs/02-reference/context-and-memory-management.md
  - ../../docs/02-reference/implementation-proposals.md
  - ../../docs/02-reference/standard-pilot-spec.md
---

# Context Builder Contract

## Purpose

Define the logical contract of the service that reconstructs context before each model request.

## Inputs

- `tenant_id`
- `user_id`
- `role`
- `conversation_id`
- `capability_id`
- `case_id` or `entity_id` when applicable
- `current_user_request`

## Outputs

- `product_rules`
- `tenant_rules`
- `user_permissions`
- `case_state`
- `retrieved_context`
- `recent_messages`
- `open_questions` when context is insufficient

## Responsibilities

- validate tenant and role identity
- recover conversation summary and recent messages
- recover capability-specific data
- filter retrieved data by permissions
- construct final request payload
- emit enough references for audit and traceability

## Fallback

- ask for clarification when context is insufficient
- do not execute sensitive actions by inference
- record `context_insufficient` in technical trace
