---
id: tech-accessibility-preference-model
title: Accessibility Preference Model
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./accessibility-architecture.md
  - ./tenant-theme-contract.md
  - ../02-data/data-model-phase-2.md
---

# Accessibility Preference Model

## Purpose

Freeze the preference schema and governance model for accessibility personalization.

## New frontend-facing contracts

- `GET /me/ui-profile`
- `PATCH /me/ui-profile`
- `GET /tenants/current/ui-baseline`
- `PATCH /tenants/current/ui-baseline`

## `UiProfile`

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

## `TenantUiBaseline`

```yaml
tenant_id: string
branding:
  app_name: string
  logo_url: string?
  accent_token: string
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

## `ResolvedAccessibilityPreferences`

```yaml
tenant_id: string
user_id: string
source_layers:
  platform: object
  user: object
  tenant: object
  product: object
resolved:
  font_scale: string
  line_spacing_mode: string
  letter_spacing_mode: string
  contrast_mode: string
  color_theme_mode: string
  focus_indicator_mode: string
  reduced_motion: string
  content_density: string
  icon_label_mode: string
  message_width_mode: string
  form_assistance_mode: string
  screen_reader_hints: string
```

## Resolution rules

1. platform accessibility settings win when supported
2. user overrides win over tenant baseline
3. tenant baseline wins over product default
4. unsafe combinations are normalized to the nearest safe preset
