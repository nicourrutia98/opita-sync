---
id: tech-data-model-phase-3-orchestrator
title: Data Model Phase 3 Orchestrator
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: phase-3
related_docs:
  - ./data-model-phase-2.md
  - ../01-tools/tool-registry-spec.md
  - ../01-tools/positive-action-model.md
---

# Data Model Phase 3 Orchestrator

## Purpose

Define the next data-model layer required for the governed tool-based orchestrator.

## New table: `tool_registry`

- `id`
- `tenant_id`
- `tool_code`
- `tool_version`
- `capability_code`
- `tool_type`
- `risk_level`
- `execution_mode`
- `certification_status`
- `tenant_scope_mode`
- `permissions_required_json`
- `requires_provider`
- `rollback_strategy`
- `input_contract_ref`
- `output_contract_ref`
- `created_at`
- `updated_at`

## New table: `action_policy_rules`

- `id`
- `tenant_id`
- `capability_code`
- `tool_code`
- `risk_level`
- `default_execution_mode`
- `tenant_override_json`
- `updated_at`

## New table: `tool_execution_attempts`

- `id`
- `tenant_id`
- `conversation_id`
- `case_id`
- `intent_code`
- `capability_code`
- `tool_code`
- `tool_version`
- `execution_mode`
- `confirmation_required`
- `confirmation_status`
- `execution_result`
- `created_at`

## New table: `positive_actions`

- `id`
- `tenant_id`
- `conversation_id`
- `case_id`
- `capability_code`
- `tool_code`
- `tool_version`
- `execution_attempt_id`
- `audit_event_id`
- `provider_trace_id`
- `created_at`

## Relationship rules

- `tool_execution_attempts` links business capability to technical execution
- `positive_actions` is derived only from successful execution attempts
- `llm_traces` and `audit_events` remain separate but referenceable
