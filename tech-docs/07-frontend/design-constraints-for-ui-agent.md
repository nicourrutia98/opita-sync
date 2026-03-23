---
id: tech-design-constraints-for-ui-agent
title: Design Constraints For UI Agent
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./mockup-generation-brief.md
  - ./a11y-acceptance-criteria.md
  - ./design-token-spec.md
---

# Design Constraints For UI Agent

## Layout constraints

- preserve chat-first workspace
- do not remove rails, sheets, or detail surfaces needed for cases and forms
- mobile designs must not assume hover

## Accessibility constraints

- preserve visible focus
- preserve large tap targets
- preserve text readability at larger scales
- preserve strong semantic status patterns

## Product constraints

- do not depict Opita Sync as a generic assistant
- show operational state, roles, and traceability cues
- show clear distinction between user, assistant, tool, and system messages
- include settings surfaces for accessibility and tenant baseline
