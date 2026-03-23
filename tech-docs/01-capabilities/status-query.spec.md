---
id: tech-capability-status-query
title: Status Query Spec
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-2
related_docs:
  - ./capability-map.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/standard-pilot-spec.md
---

# Status Query Spec

## Capability code

`status_query`

## Actors

- `requester`
- `technician`
- `supervisor`

## Trigger

- natural-language question about a case status
- direct status query with `case_code`

## Intent pattern

- resolve visible operational state through a governed read path

## Inputs

- `current_user_request`
- `case_code` or resolved `case_id`

## Required context

- case header
- latest visible updates
- role visibility rules

## Outputs

- visible `status_code`
- visible `owner_user_id`
- latest allowed update summary

## Tool posture

- likely_tool_types:
  - `case_reader`
  - `context_retriever`
- default_execution_mode: `suggest`
- positive_action_eligible: yes, after successful governed read execution

## Persistence writes

- `audit_events`
- `llm_traces` when model is used

## Failure handling

- block if case does not exist in tenant scope
- block if actor lacks visibility
- ask clarification if no case can be resolved from the request
