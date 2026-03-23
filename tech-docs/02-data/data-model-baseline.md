---
id: tech-data-model-baseline
title: Data Model Baseline
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-1
related_docs:
  - ../../docs/02-reference/context-and-memory-management.md
  - ../../docs/06-compliance/data-and-retention-policy.md
  - ../../docs/02-reference/implementation-proposals.md
---

# Data Model Baseline

## Purpose

Define the minimum persistent entities needed for phase-1 operation.

## Required entities

- `tenants`
- `users`
- `roles`
- `tenant_settings`
- `conversations`
- `conversation_messages`
- `conversation_summaries`
- `cases`
- `case_context`
- `audit_events`
- `llm_traces`

## Data rules

- every relevant operational entity carries `tenant_id`
- operational memory and improvement datasets remain distinct
- `audit_events` and `llm_traces` are separate stores
- `tenant_settings` includes templates, parameters, and data-reuse opt-in

## Open questions

- exact columns per entity
- final normalization of `cases`
- retention values by record type
