---
id: tech-placeholder-brand-spec
title: Placeholder Brand Specification
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./frontend-decision-baseline.md
  - ./theme-baseline.json
  - ./tenant-theme-contract.md
  - ./insumo-intake-report.md
---

# Placeholder Brand Specification

## Purpose

Provide the current provisional brand system that is safe for implementation and now backed by accepted exported assets.

## Brand direction

- direction name: `Operational Clarity`
- personality: `governed, precise, trustworthy, restrained`
- category signal: `enterprise operational platform`
- avoid: `playful bot aesthetics`, `marketing gradients`, `ambient glow`, `purple default SaaS look`

## Wordmark rules

- primary wordmark text: `Opita Sync`
- byline text when needed: `by Opita Coders`
- placeholder lockup: wordmark only, no symbol required
- case style: title case
- use wide tracking only in headers or auth card branding, not body UI

## Placeholder color system

## Accepted identity asset palette

- ink slate: `#0B1530`
- support slate: `#64748B`
- teal: `#0F766E`
- mist background: `#F5F7F7`
- dark solid surface: `#0B2131`

The accepted `Flow Grid v3` identity assets should be treated as the canonical visual brand reference for logo, mark, app icon, and favicon usage.

### Primary palette

- `teal-700`: `#0F766E`
- `teal-800`: `#115E59`
- `slate-900`: `#111827`
- `slate-700`: `#334155`
- `slate-500`: `#64748B`
- `slate-300`: `#CBD5E1`
- `slate-100`: `#EEF2F7`
- `slate-050`: `#F7F8FA`
- `white`: `#FFFFFF`

### Semantic palette

- success: `#166534`
- warning: `#A16207`
- error: `#B91C1C`
- info: `#1D4ED8`
- focus: `#0F62FE`

## Typography system

- base font: `Source Sans 3, Noto Sans, Segoe UI, sans-serif`
- mono font: `IBM Plex Mono, ui-monospace, monospace`
- headings: semibold
- body: regular
- labels/actions: medium

## Surface treatment

- app background: light neutral surface
- panels: white or slightly elevated neutral
- borders: visible but restrained
- shadows: subtle, secondary to border definition
- primary actions: teal filled
- destructive actions: use semantic error color only

## Empty-state policy

- default: text-first empty states
- optional support element: single neutral line icon
- no decorative illustration required in v1

## Avatar policy

- default avatar: initials from display name
- secondary marker: role badge or role tint
- no uploaded user images required in v1

## Dark mode rule

- not required as primary baseline for v1
- if introduced later, preserve the same semantic mapping and contrast thresholds

## Reconciliation rule

- identity asset colors are accepted as canonical for brand rendering
- application UI tokens remain governed by `theme-baseline.json` until a full screen system is reconciled
- future UI visual work should move the screen system toward the accepted identity, not the other way around
