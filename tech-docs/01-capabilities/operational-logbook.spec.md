---
id: tech-capability-operational-logbook
title: Operational Logbook Spec
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-2
related_docs:
  - ./capability-map.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/standard-pilot-spec.md
---

# Operational Logbook Spec

## Capability code

`operational_logbook`

## Actors

- `technician`

## Trigger

- operational update for an active case

## Intent pattern

- record a governed operational update against an active case

## Inputs

- `current_user_request`
- `case_id`
- `log_entry_type`
- `evidence_refs`
- `structured_update`

## Required context

- active case state
- allowed evidence types
- mutation validation rules

## Outputs

- appended logbook record in `case_context`
- updated case state when applicable
- audit event with before/after

## Tool posture

- likely_tool_types:
  - `logbook_writer`
  - `state_transition_checker`
- default_execution_mode: `confirm_then_execute`
- positive_action_eligible: yes, after successful governed write

## Persistence writes

- `case_context`
- `cases` when status or owner changes
- `audit_events`
- `llm_traces` when model is used

## Failure handling

- block if actor is not assigned or otherwise authorized
- block if evidence violates tenant rules
- block if update implies a forbidden state transition
- block if confirmation is required and not provided
