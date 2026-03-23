---
id: tech-accessibility-architecture
title: Accessibility Architecture
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./accessibility-preference-model.md
  - ./a11y-acceptance-criteria.md
  - ./aria-and-keyboard-contracts.md
  - ../../docs/01-explanation/foundations.md
---

# Accessibility Architecture

## Purpose

Define accessibility as a first-class frontend subsystem.

## Compliance target

- mandatory baseline: `WCAG 2.2 AA`
- preferred implementation target: exceed AA for focus visibility, target size, and reduced-motion handling

## System model

Accessibility is resolved through four layers:

1. platform assistive settings
2. user accessibility overrides
3. tenant accessibility baseline
4. product default

## Required accessibility subsystems

- semantic token resolver
- typography scaler
- contrast-safe theme resolver
- focus ring resolver
- motion policy resolver
- screen reader labeling layer
- live region announcement layer
- keyboard navigation contracts for web
- mobile target size and dynamic text scaling guardrails

## Non-negotiable rules

- no theme can reduce contrast below baseline requirements
- no tenant override can disable focus indicators
- no user preference can remove required labels or status meaning
- no interaction can require drag if an equivalent non-drag path exists
- authentication must remain compatible with paste, autofill, and password managers
