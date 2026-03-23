---
id: tech-frontend-flow-map
title: Frontend Flow Map
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: frontend
related_docs:
  - ./role-journeys.md
  - ./screen-inventory.md
  - ../01-capabilities/capability-map.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/orchestrator-operating-model.md
---

# Frontend Flow Map

## Purpose

Freeze the top-level frontend information architecture and primary user flows.

## Entry model

- entry experience: `chat-first workspace`
- supported platforms: `web`, `ios`, `android`
- first route after successful auth: `workspace/current`
- workspace is the primary shell for conversation, case context, guided forms, and operational tracking
- main thread is the densest information region
- chat is the primary information source and system panels stay compact by default

## Top-level routes

```yaml
/auth
/invite/accept
/workspace/current
/workspace/conversations/:id
/workspace/cases/:id
/admin/tools
/admin/tools/:id
/admin/confirmations
/admin/executions
/admin/positive-actions
/settings/profile
/settings/accessibility
/settings/tenant
/settings/tenant/members
/settings/tenant/permissions
```

## Workspace shell

### Desktop

- left rail: conversations, current cases, quick filters
- main panel: active thread
- right rail: case context, visible actions, structured form state

### Mobile

- default view: active thread
- secondary navigation: drawer or bottom sheet
- contextual details: sheet or stacked detail page

## Global flow states

- anonymous
- authenticated without membership
- authenticated with pending invitation
- authenticated with active membership
- blocked by permission
- blocked by missing case or context
- blocked by policy
- requires confirmation
- execution success
- execution failure
- degraded connectivity

## Capability entry points

### `request_create`

- primary entry: natural-language prompt inside thread
- structured continuation: guided form panel
- runtime states:
  - `blocked` when required fields are missing
  - `requires_confirmation` after governed payload is prepared
  - `success` only after explicit confirmation and tool execution
- completion artifact: confirmation sheet followed by created case card with summary and status

### `status_query`

- primary entry: natural-language prompt inside thread
- secondary entry: case detail route
- default execution mode: `suggest`
- completion artifact: compact governed result card and timeline excerpt

### `operational_logbook`

- primary entry: visible action in case context rail
- completion artifact: appended timeline/logbook item

### `draft_generation`

- primary entry: action from case context rail or composer shortcut
- completion artifact: draft preview panel with confirm/discard actions

## Orchestrator runtime states

- `suggest`
- `confirm_then_execute`
- `auto_execute`
- `blocked`
- `requires_confirmation`
- `success`
- `failed`

## Admin governance entry points

### `tool registry`

- primary entry: `admin/tools`
- supports `draft`, `reviewed`, `certified`, `production`, `deprecated`
- tenant-admin can create, patch, review, certify, promote, and deprecate tools

### `confirmation requests`

- primary entry: `admin/confirmations`
- surfaces pending, confirmed, rejected, and expired requests
- supervisor and tenant-admin can inspect execution intent and confirmation posture

### `execution observability`

- primary entry: `admin/executions`
- shows tool executions, results, linked cases, and positive actions where allowed

## Role gates

- `requester`: create request, view own conversations, view allowed case state
- `technician`: view assigned cases, append operational logbook, generate drafts when permitted
- `supervisor`: inspect wider case scope, review current state, intervene through approved actions
- `tenant-admin`: manage members, tenant settings, baseline accessibility and branding tokens, and tool lifecycle transitions

## Cross-flow invariants

- tenant and role context must be resolved before rendering visible actions
- thread messages may reveal capability suggestions but not hidden permissions
- mutating actions must show tool name, execution mode, and confirmation state before execution
- system never relies on provider-side model memory for UI state
- case state and conversation state are distinct but linked when `active_case_id` is present
- right rail is collapsible and summary-first; it must never become the primary source of truth
