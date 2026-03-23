---
id: tech-capability-draft-generation
title: Draft Generation Spec
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-2
related_docs:
  - ./capability-map.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/standard-pilot-spec.md
---

# Draft Generation Spec

## Capability code

`draft_generation`

## Actors

- `technician`
- `supervisor`

## Trigger

- request to produce a draft tied to a case

## Intent pattern

- generate a governed draft artifact without mutating an external system

## Inputs

- `current_user_request`
- `case_id`
- `draft_type`

## Required context

- case summary
- tenant template
- output tone and formatting rules
- approval requirement flags

## Outputs

- generated draft text
- optional structured draft metadata
- audit event and model trace

## Tool posture

- likely_tool_types:
  - `template_resolver`
  - `draft_generator`
- default_execution_mode: `suggest`
- positive_action_eligible: yes, after successful draft generation under governed path

## Persistence writes

- `audit_events`
- `llm_traces`
- optional `case_context` record for saved draft metadata

## Failure handling

- block if actor lacks draft permission
- block if no valid template exists for requested draft type
- ask clarification if the draft objective is ambiguous
