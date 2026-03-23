---
id: tech-wireflow-spec
title: Wireflow Specification
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: frontend
related_docs:
  - ./frontend-flow-map.md
  - ./role-journeys.md
  - ../03-context/context-builder-interface.md
  - ../../docs/02-reference/orchestrator-operating-model.md
---

# Wireflow Specification

## Purpose

Provide a screen-to-screen behavioral contract for design and frontend implementation.

## Flow 1. Sign in and workspace bootstrap

1. user opens `auth-sign-in`
2. user chooses `google`, `email/password`, or `phone`
3. app exchanges identity and resolves membership
4. if no membership: show `invite-accept` or `membership-blocked`
5. if membership exists: route to `workspace/current`
6. workspace loads visible conversations, visible cases, and current accessibility preferences

## Flow 2. Natural-language request to structured request

1. user types request in composer
2. thread shows assistant clarifying questions
3. guided form panel opens with extracted values
4. user completes required fields
5. app sends `request_create` to `POST /api/orchestrator/execute`
6. if missing fields remain, thread shows `blocked` card with `openQuestions`
7. if payload is valid, runtime returns `requires_confirmation`
8. app opens `confirmation-request-sheet` with compact payload summary and target tool
9. user confirms through `POST /api/orchestrator/confirm/:id`
10. thread shows case-created tool message on success
11. right rail or mobile detail view shows case summary card

## Flow 3. Status query

1. user asks for status in composer or opens existing case
2. app sends `status_query` to `POST /api/orchestrator/execute`
3. runtime resolves `case_status_reader.v1`
4. thread shows governed status response card
5. case panel shows status card, owner, and last visible updates

## Flow 4. Logbook update

1. technician opens case
2. visible action `add update` opens logbook entry panel
3. technician enters note and evidence metadata
4. submit appends entry
5. thread and case timeline refresh

## Flow 5. Draft generation

1. technician or supervisor opens draft generation action
2. app previews source context and constraints
3. generated draft appears in preview panel
4. user chooses `insert`, `copy`, `discard`, or `revise`

## Flow 6. Tenant accessibility baseline

1. tenant-admin opens tenant accessibility baseline
2. app shows previewable presets and advanced settings
3. if persistence endpoints are available, admin saves baseline through `PATCH /api/tenants/current/ui-baseline`
4. if persistence endpoints are not available, screen is `read-only pending backend support`
5. active user still keeps own overrides where present

## Flow 7. User accessibility override

1. user opens personal accessibility settings
2. user changes font size, contrast mode, motion, or spacing
3. app applies live preview
4. if persistence endpoints are available, user saves through `PATCH /api/me/ui-profile`
5. otherwise screen is `read-only pending backend support`

## Flow 8. Tool governance lifecycle

1. tenant-admin opens `admin/tools`
2. admin creates or edits tool metadata in `draft`
3. admin reviews the tool
4. admin certifies the tool
5. admin promotes the tool to `production`
6. app shows transition result in tool detail and execution governance surfaces

## Flow 9. Confirmation queue review

1. supervisor or tenant-admin opens `admin/confirmations`
2. app lists pending and resolved confirmation requests
3. actor inspects payload, target tool, and status
4. when allowed, actor confirms or rejects request
5. thread and execution views refresh after resolution

## Failure handling rules

- if context builder returns `blocked`: show clear reason and safe next step
- if permission fails: show explanatory denial state, not silent disappearance after navigation
- if offline while editing form or logbook: preserve local draft and show explicit sync status
- if execution returns `requires_confirmation`: do not treat as success or failure
- if a tool transition fails due to certification state or permissions: show blocking reason inline in admin flow
