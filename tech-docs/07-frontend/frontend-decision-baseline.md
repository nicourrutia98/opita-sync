---
id: tech-frontend-decision-baseline
title: Frontend Decision Baseline
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: frontend
related_docs:
  - ./placeholder-brand-spec.md
  - ./asset-production-contract.md
  - ./ui-interface-contracts.md
  - ./ui-copy-baseline.md
  - ./insumo-intake-report.md
---

# Frontend Decision Baseline

## Purpose

Freeze all remaining non-image frontend decisions and register which external visual assets are now accepted into the baseline.

## Canonical defaults

- product display name: `Opita Sync`
- brand owner display: `Opita Coders`
- short mark: `OS`
- visual direction: `Operational Clarity`
- default theme family: `neutral-accessible teal`
- default theme mode: `light`
- typography base: `Source Sans 3`
- typography mono: `IBM Plex Mono`
- icon style: `single-family outline icons with text labels on critical controls`
- illustration policy: `none required in v1`
- avatar policy: `initials + role badge`
- support contact: `support@opitacoders.com`
- legal footer: `Opita Sync by Opita Coders. Pilot environment.`
- accepted identity package: `Flow Grid v3`
- accepted screen reference package: `next screens pack` with observations

## Remaining pending inputs after this baseline

- supervisor workspace visual
- tenant-admin settings and members visual
- user accessibility settings visual
- tenant accessibility baseline visual
- optional illustration files
- optional branded pattern or background files
- final color reconciliation between accepted identity assets and partial screen references

## Explicitly closed decisions

- final placeholder brand palette is no longer pending
- final placeholder typography is no longer pending
- final placeholder support text is no longer pending
- final placeholder legal footer is no longer pending
- final avatar policy is no longer pending
- final no-illustration default is no longer pending
- provisional logo, mark, app icon, and favicon assets are no longer pending

## Product guardrails

- no final or placeholder decision may weaken accessibility constraints
- placeholder branding is safe to ship for internal or pilot use
- tenant customization remains constrained by `tenant-theme-contract.md`
- `Flow Grid v3` is the accepted identity baseline
- `next screens pack` remains partial reference only and must not override the accepted brand palette
- chat is the primary information surface on every role workspace
- persistent helper text must stay minimal
- right rail stays collapsible and summary-first
- prefer teal identity accents over saturated blue action accents in new implementation
