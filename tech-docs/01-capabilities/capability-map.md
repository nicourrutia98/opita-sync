---
id: tech-capability-map
title: Capability Map
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-1
related_docs:
  - ../../docs/02-reference/standard-pilot-spec.md
  - ../../docs/02-reference/capability-governance.md
  - ../../docs/02-reference/orchestrator-operating-model.md
---

# Capability Map

## Purpose

Translate the approved pilot baseline into build-oriented capability contracts.

## Canonical separation

- `intent` expresses user goal
- `capability` resolves governed business behavior
- `tool` performs technical read or write execution
- `action policy` decides suggestion, confirmation, or auto-execution

Capabilities below describe the governed layer. They are not equivalent to technical tools.

## Capability set

### `request_create`

- actors: `requester`
- inputs: natural-language request, structured form data
- outputs: created case with initial status
- required_context: tenant rules, role, assignment rules, form schema
- audit_events: `case_created`
- likely_tool_types: `case_writer`, `form_validator`, `assignment_resolver`
- default_execution_mode: `confirm_then_execute`

### `status_query`

- actors: `requester`, `technician`, `supervisor`
- inputs: case reference, natural-language status query
- outputs: visible status, owner, latest allowed update
- required_context: case state, role visibility, recent updates
- audit_events: `case_status_queried`
- likely_tool_types: `case_reader`, `context_retriever`
- default_execution_mode: `suggest`

### `operational_logbook`

- actors: `technician`
- inputs: progress note, evidence, operational update
- outputs: appended logbook entry
- required_context: active case, validation rules, evidence policy
- audit_events: `case_logbook_updated`
- likely_tool_types: `logbook_writer`, `state_transition_checker`
- default_execution_mode: `confirm_then_execute`

### `draft_generation`

- actors: `technician`, `supervisor`
- inputs: case context, draft objective
- outputs: generated draft
- required_context: case summary, tenant template, output constraints
- audit_events: `draft_generated`
- likely_tool_types: `template_resolver`, `draft_generator`
- default_execution_mode: `suggest`

## Future tool-governed expansion

- read-only tools may qualify for `auto_execute` only under explicit low-risk policy
- mutating tools require explicit risk classification and certification
- capability growth should happen by adding governed tools under stable capability contracts, not by ad hoc prompt branches

## Wedge mapping

- `data_access` -> `status_query` + contextual retrieval
- `form_filling` -> `request_create` + `draft_generation`
- `operational_tracking` -> `status_query` + `operational_logbook`

## Governance constraints

- no direct client publication in v1
- tenant customization stays inside template boundaries
- new logic, integrations, or complex data rules become additional development
