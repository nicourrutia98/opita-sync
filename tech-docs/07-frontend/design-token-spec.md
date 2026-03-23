---
id: tech-design-token-spec
title: Design Token Specification
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./theme-baseline.json
  - ./tenant-theme-contract.md
  - ./motion-and-focus-spec.md
---

# Design Token Specification

## Purpose

Define semantic frontend tokens before visual implementation.

## Token groups

- `color.surface.*`
- `color.text.*`
- `color.border.*`
- `color.action.*`
- `color.status.*`
- `color.focus.*`
- `spacing.*`
- `radius.*`
- `elevation.*`
- `typography.*`
- `motion.*`
- `layout.*`

## Core semantic tokens

```yaml
color.surface.app
color.surface.panel
color.surface.elevated
color.surface.input
color.text.primary
color.text.secondary
color.text.muted
color.text.inverse
color.border.default
color.border.strong
color.action.primary
color.action.primaryText
color.action.secondary
color.status.success
color.status.warning
color.status.error
color.status.info
color.focus.ring
color.focus.ringOffset
```

## Rules

- component code consumes semantic tokens only
- tenant theme customization maps into semantic token slots
- accessibility resolver may override token outputs at runtime
