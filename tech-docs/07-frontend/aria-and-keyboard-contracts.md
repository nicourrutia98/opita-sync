---
id: tech-aria-keyboard-contracts
title: Aria And Keyboard Contracts
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend-web
related_docs:
  - ./a11y-acceptance-criteria.md
  - ./screen-inventory.md
---

# Aria And Keyboard Contracts

## Purpose

Freeze keyboard and semantic expectations for complex frontend patterns.

## Dialogs and sheets

- opening a dialog moves focus into the dialog
- `Tab` and `Shift+Tab` stay within the dialog while open
- `Escape` closes when the action is safe to dismiss
- closing returns focus to the invoking control

## Tabs

- active tab receives focus when entering the tab list
- arrow keys move between tabs
- panel association is explicit through semantic roles and labeling

## Toolbars

- toolbar is used only when the group contains 3 or more controls
- web toolbars use roving focus or equivalent predictable focus behavior
- arrow key movement inside the toolbar does not trap the user

## Combobox and command search

- input has explicit label
- listbox options expose active descendant or equivalent state
- keyboard supports open, close, navigate, commit, and dismiss

## Thread semantics

- thread is a labeled region
- each message has a perceivable sender type
- system and tool messages expose status semantics
- live announcements are rate-limited to avoid noisy screen reader output
