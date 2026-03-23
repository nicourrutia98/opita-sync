---
id: tech-capability-request-create
title: Request Create Spec
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-2
related_docs:
  - ./capability-map.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/standard-pilot-spec.md
---

# Request Create Spec

## Capability code

`request_create`

## Actors

- `requester`

## Trigger

- natural-language request to create a new operational case
- structured form submission for a new case

## Intent pattern

- create a governed operational request from language or structured input

## Inputs

- `current_user_request`
- `case_type`
- `priority_code`
- `structured_fields`

## Required context

- tenant form schema
- required fields
- assignment rules
- allowed case types

## Outputs

- created `case`
- initial `audit_event`
- assistant response with `case_code` and `status_code`

## Tool posture

- likely_tool_types:
  - `case_writer`
  - `form_validator`
  - `assignment_resolver`
- default_execution_mode: `confirm_then_execute`
- positive_action_eligible: yes, after successful case creation

## Persistence writes

- `cases`
- `case_context`
- `audit_events`
- `llm_traces` when model is used

## Failure handling

- block if required fields remain unresolved
- ask clarification for ambiguous natural-language input
- block if requester lacks permission to create the case type
- block if action policy requires confirmation and confirmation is absent
