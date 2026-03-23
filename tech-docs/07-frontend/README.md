---
id: tech-frontend-root
title: Frontend Input Pack
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: frontend
related_docs:
  - ../00-system/system-architecture.md
  - ../01-capabilities/capability-map.md
  - ../02-data/data-model-phase-3-orchestrator.md
  - ../03-context/context-builder-interface.md
  - ../../docs/01-explanation/foundations.md
  - ../../docs/02-reference/orchestrator-operating-model.md
  - ../../frontend/README.md
---

# Frontend Input Pack

## Purpose

Provide a complete, implementation-ready frontend input layer for Opita Sync before visual mockup generation or frontend coding begins.

## Reading order

1. `frontend-flow-map.md`
2. `role-journeys.md`
3. `screen-inventory.md`
4. `wireflow-spec.md`
5. `frontend-decision-baseline.md`
6. `insumo-intake-report.md`
7. `placeholder-brand-spec.md`
8. `asset-production-contract.md`
9. `ui-interface-contracts.md`
10. `accessibility-architecture.md`
11. `accessibility-preference-model.md`
12. `a11y-acceptance-criteria.md`
13. `aria-and-keyboard-contracts.md`
14. `design-token-spec.md`
15. `tenant-theme-contract.md`
16. `motion-and-focus-spec.md`
17. `ui-copy-baseline.md`
18. `mock-data-schema.md`
19. `asset-requirements.md`
20. `mockup-generation-brief.md`

## Rules

- this package remains subordinate to `docs/` and `tech-docs/`
- frontend starts as `chat-first workspace`
- accessibility is a configurable product capability, not a post-build audit
- tenant branding may customize presentation but must not break accessibility invariants
- after `frontend-decision-baseline.md`, branding decisions are closed and only remaining visual deliverables stay pending
- runtime-aligned frontend flows must reflect `suggest`, `blocked`, `requires_confirmation`, and `success`
- `request_create` is confirmation-gated and must not be represented as direct submit-only creation
