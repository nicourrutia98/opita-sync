---
id: tech-a11y-acceptance-criteria
title: Accessibility Acceptance Criteria
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./accessibility-architecture.md
  - ./aria-and-keyboard-contracts.md
  - ./motion-and-focus-spec.md
---

# Accessibility Acceptance Criteria

## Purpose

Provide implementation and QA gates for accessible frontend delivery.

## Layout and readability

- content remains usable at `320 CSS px` equivalent width
- text spacing adjustments do not break controls or hide content
- content remains readable at increased text scale
- message thread and case panels reflow without forced horizontal scrolling in normal reading mode

## Interaction

- all web interactions are keyboard reachable
- visible focus is present for every interactive element
- focus indicator meets minimum visible area and contrast expectations
- interactive targets are at least `24x24` CSS px equivalent
- drag interactions, if introduced later, have a single-pointer alternative
