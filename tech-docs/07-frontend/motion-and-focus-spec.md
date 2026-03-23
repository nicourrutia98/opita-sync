---
id: tech-motion-focus-spec
title: Motion And Focus Specification
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./design-token-spec.md
  - ./a11y-acceptance-criteria.md
---

# Motion And Focus Specification

## Purpose

Freeze motion and focus behavior across the frontend.

## Motion policy

- meaningful motion only
- no decorative looping motion in critical workflow surfaces
- streaming indicators must have reduced-motion alternatives
- route and panel transitions under reduced-motion become fade or instant

## Focus policy

- every interactive element has visible focus
- focus appearance uses strong perimeter or equivalent area
- focus order matches reading order and workflow priority
- opening and closing overlays preserves logical focus return
