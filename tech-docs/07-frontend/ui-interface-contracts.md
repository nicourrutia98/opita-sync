---
id: tech-ui-interface-contracts
title: UI Interface Contracts
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: frontend
related_docs:
  - ./accessibility-preference-model.md
  - ./frontend-decision-baseline.md
  - ../02-data/data-model-phase-2.md
  - ../02-data/data-model-phase-3-orchestrator.md
---

# UI Interface Contracts

## Purpose

Freeze the frontend-facing contracts required by the orchestrator workspace, admin governance surfaces, and theming/accessibility settings.

## Required endpoints

- `GET /auth/me`
- `POST /orchestrator/execute`
- `POST /orchestrator/confirm/:id`
- `GET /confirmation-requests`
- `POST /confirmation-requests/:id/confirm`
- `POST /confirmation-requests/:id/reject`
- `GET /tools`
- `POST /tools`
- `PATCH /tools/:id`
- `POST /tools/:id/review`
- `POST /tools/:id/certify`
- `POST /tools/:id/promote`
- `POST /tools/:id/deprecate`
- `GET /tool-executions`
- `GET /positive-actions`
- `GET /me/ui-profile`
- `PATCH /me/ui-profile`
- `GET /tenants/current/ui-baseline`
- `PATCH /tenants/current/ui-baseline`

## Currently implemented backend routes

- `GET /api/auth/me`
- `POST /api/orchestrator/execute`
- `POST /api/orchestrator/confirm/:id`
- `GET /api/confirmation-requests`
- `POST /api/confirmation-requests/:id/confirm`
- `POST /api/confirmation-requests/:id/reject`
- `GET /api/tools`
- `POST /api/tools`
- `PATCH /api/tools/:id`
- `POST /api/tools/:id/review`
- `POST /api/tools/:id/certify`
- `POST /api/tools/:id/promote`
- `POST /api/tools/:id/deprecate`
- `GET /api/tool-executions`
- `GET /api/positive-actions`

## Backend dependencies still required for settings persistence

- `GET /api/me/ui-profile`
- `PATCH /api/me/ui-profile`
- `GET /api/tenants/current/ui-baseline`
- `PATCH /api/tenants/current/ui-baseline`

## `POST /orchestrator/execute`

### Request

```yaml
conversationId: string
capabilityCode: string
currentUserRequest: string?
caseId: string?
entityId: string?
caseType: string?
priorityCode: string?
structuredFields: object?
```

### Response

```yaml
capabilityCode: string
toolCode: string
toolVersion: string
executionMode: suggest | confirm_then_execute | auto_execute
executionResult: success | failed | blocked | requires_confirmation
confirmationRequired: boolean
confirmationStatus: not_required | pending | confirmed | rejected
confirmationId: string?
payload: object
blockedReason: string?
openQuestions: string[]?
```

## `POST /orchestrator/confirm/:id`

### Response

```yaml
capabilityCode: string
toolCode: string
toolVersion: string
executionMode: confirm_then_execute
executionResult: success | failed | blocked
payload: object
caseId: string?
caseCode: string?
statusCode: string?
```

## `GET /tools`

### Response item

```yaml
id: string
toolCode: string
toolVersion: string
capabilityCode: string
toolType: string
riskLevel: read_only | draft_only | write_with_confirmation | auto_executable_low_risk
executionMode: suggest | confirm_then_execute | auto_execute
certificationStatus: draft | reviewed | certified | production | deprecated
permissionsRequiredJson: string[]
requiresProvider: boolean
updatedAt: string
```

## `GET /confirmation-requests`

### Response item

```yaml
id: string
capabilityCode: string
toolCode: string
toolVersion: string
status: pending | confirmed | rejected | expired
requestedPayloadJson: object
expiresAt: string
confirmedAt: string?
confirmedByUserId: string?
```

## `GET /me/ui-profile`

### Response

```yaml
user_id: string
tenant_id: string
display_name: string
locale: string
timezone: string
accessibility_overrides:
  font_scale: compact | normal | large | x-large
  line_spacing_mode: normal | relaxed
  letter_spacing_mode: normal | relaxed
  contrast_mode: system | standard | high
  color_theme_mode: system | light | dark
  focus_indicator_mode: standard | strong
  reduced_motion: system | on | off
  content_density: compact | comfortable
  icon_label_mode: auto | always
  message_width_mode: standard | wide
  form_assistance_mode: standard | guided
  screen_reader_hints: auto | on | off
```

## `PATCH /me/ui-profile`

### Request

- partial update of `accessibility_overrides`
- reject unsafe values or normalize to safe preset

## `GET /tenants/current/ui-baseline`

### Response

```yaml
tenant_id: string
branding:
  app_name: string
  brand_owner: string
  logo_url: string?
  short_mark: string
  support_contact: string
  legal_footer_text: string
theme_defaults:
  color_theme_mode: light | dark | system
  contrast_mode: standard | high
  focus_indicator_mode: standard | strong
  content_density: compact | comfortable
accessibility_defaults:
  font_scale: compact | normal | large
  line_spacing_mode: normal | relaxed
  letter_spacing_mode: normal | relaxed
  reduced_motion: on | off | system
  form_assistance_mode: standard | guided
```

## `PATCH /tenants/current/ui-baseline`

### Request

- partial update of `branding`, `theme_defaults`, or `accessibility_defaults`
- do not allow arbitrary unsafe colors or disabling required focus/contrast behavior

## Frontend consumption rules

- bootstrap loads session and membership first
- workspace loads orchestrator-visible state before rendering action controls
- bootstrap loads tenant baseline first
- authenticated session then loads user profile overrides
- resolved preferences drive tokens before rendering interactive workspace where practical
- if profile fetch fails, app falls back to tenant baseline and logs recoverable error
