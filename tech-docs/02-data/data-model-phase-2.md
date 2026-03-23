---
id: tech-data-model-phase-2
title: Data Model Phase 2
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-2
related_docs:
  - ./data-model-baseline.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/context-and-memory-management.md
---

# Data Model Phase 2

## Purpose

Freeze the minimum phase-2 persistence contract required to implement the pilot backend.

## Table: `tenants`

- `id`
- `name`
- `status`
- `timezone`
- `data_reuse_opt_in`
- `retention_policy_code`
- `created_at`
- `updated_at`

## Table: `users`

- `id`
- `tenant_id`
- `external_ref`
- `display_name`
- `email`
- `status`
- `created_at`
- `updated_at`

## Table: `user_roles`

- `id`
- `tenant_id`
- `user_id`
- `role_code`
- `assigned_at`

## Table: `tenant_settings`

- `id`
- `tenant_id`
- `setting_group`
- `setting_key`
- `setting_value_json`
- `version`
- `updated_at`

## Table: `conversations`

- `id`
- `tenant_id`
- `user_id`
- `role_code`
- `active_case_id`
- `status`
- `last_summary_id`
- `last_capability_code`
- `created_at`
- `updated_at`

## Table: `conversation_messages`

- `id`
- `tenant_id`
- `conversation_id`
- `message_index`
- `sender_type`
- `sender_ref`
- `content_text`
- `content_structured_json`
- `is_sensitive`
- `created_at`

## Table: `conversation_summaries`

- `id`
- `tenant_id`
- `conversation_id`
- `summary_text`
- `summary_structured_json`
- `source_message_from`
- `source_message_to`
- `created_at`

## Table: `cases`

- `id`
- `tenant_id`
- `case_code`
- `case_type`
- `status_code`
- `priority_code`
- `requester_user_id`
- `owner_user_id`
- `created_from_conversation_id`
- `created_at`
- `updated_at`

## Table: `case_context`

- `id`
- `tenant_id`
- `case_id`
- `context_type`
- `context_key`
- `context_value_json`
- `updated_at`

## Table: `audit_events`

- `id`
- `tenant_id`
- `actor_user_id`
- `actor_role_code`
- `conversation_id`
- `case_id`
- `capability_code`
- `event_code`
- `entity_type`
- `entity_id`
- `before_state_json`
- `after_state_json`
- `result_code`
- `created_at`

## Table: `llm_traces`

- `id`
- `tenant_id`
- `conversation_id`
- `case_id`
- `capability_code`
- `provider_name`
- `model_name`
- `request_contract_json`
- `response_contract_json`
- `token_input_count`
- `token_output_count`
- `latency_ms`
- `result_code`
- `created_at`

## Implementation rules

- every table except static catalogs carries `tenant_id`
- every mutating capability writes at least one row to `audit_events`
- every provider call writes one row to `llm_traces`
- `conversation_messages` and `conversation_summaries` are operational memory, not improvement data by default
- `tenant_settings.setting_value_json` is the only flexible configuration payload in phase 2
