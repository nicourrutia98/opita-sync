# Implementation Batch Plan

## Batch 1

- Create frontend request artifacts.
- Install and configure React, Vite, Tailwind, and Storybook.
- Create frontend architecture and visual-system docs.

## Batch 2

- Implement primitives, layout shell, navigation, and shared states.
- Implement priority views driven by mock contracts.
- Add Storybook stories.

## Batch 3

- Update build pipeline and tests.
- Run validation and record compliance evidence.

## Batch 4

- Integrate runtime branding with Flow Grid v3 assets and a proposed app icon.
- Add semantic light and dark theme tokens.
- Implement the supervisor workspace as the next priority view.
- Extend Storybook and Playwright coverage for the new shell behavior.

## Batch 5

- Introduce `OpitaAppServices` and split domain types, API DTOs, and view models.
- Add stub and remote adapters plus env-driven runtime service selection.
- Rewire app views to async loading, empty, error, success, and retry states.
- Harden package identity, README, and reproducible environment config.
- Make `ci` self-contained inside `opita-sync/` including Storybook build and legacy scaffold compatibility checks.

## Batch 6

- Add `authService`, session persistence, and tenant-scoped authenticated bootstrap.
- Implement mobile-first auth shell with login, reset request, reset confirmation, and sign-out.
- Extend stub and remote adapters with bearer auth, `401`, and `403` behavior.
- Document auth states in Storybook and validate login/session flows in Playwright.

## Batch 7

- Replace legacy validation source with `scripts/lib/opita-release-data.mjs`.
- Migrate `content` and `lint` checks to the Opita-specific descriptor.
- Remove `control-plane` alias specs from e2e, visual, and a11y suites.
- Update integration structure checks to target canonical `opita-sync` paths only.

## Batch 8

- Publish `docs/specs/opita-sync/integration-master-plan.md` as the 4-release execution source of truth.
- Publish `docs/test-plans/opita-sync-integration-and-regression-plan.md` for release gate and regression policy.
- Link release and module testing docs to the new integration baseline.
- Update active request acceptance and compliance mapping for FE-14 and FE-15.

## Batch 9

- Publish `docs/specs/opita-sync/release-1-execution-board.md` with contract, UI, audit, and test tickets.
- Define dependency ordering and parallelization rules for Release 1 execution.
- Attach Release 1 done definition and evidence requirements.
- Link the board into integration and release baselines.

## Batch 10

- Publish `docs/specs/opita-sync/release-2-execution-board.md` with contract, UI, audit, and test tickets.
- Define dependency ordering and parallelization rules for Release 2 execution.
- Attach Release 2 done definition and evidence requirements.
- Keep external ticketization explicitly pending by request.

## Batch 11

- Publish external tracker ticketization package for Release 1 and Release 2.
- Add import-ready CSV exports and mapping guide under `docs/specs/opita-sync/tracker/`.
- Link ticketization artifacts from execution boards and release baseline docs.
- Mark external ticketization pending item as resolved in Release 2 board.

## Batch 12

- Implement Release 2 typed contracts and adapters for:
  - operational log entries and creation,
  - capability catalog and state toggles,
  - tool governance listing,
  - tenant parameter updates within bounded config.
- Integrate Release 2 runtime surfaces in `detalle` and `configuracion` with loading/empty/error/success states.
- Add audit-aware mutation feedback for log, capability, and tenant config actions.
- Extend Storybook and Playwright coverage for Release 2 governed flows and recoverable service errors.

## Batch 13

- Implement Release 3 typed contracts and adapters for:
  - assisted draft generation with approval metadata,
  - value/adoption reporting metrics by role and period,
  - tenant-attributed usage export for external billing handoff.
- Integrate Release 3 runtime behavior in existing mobile-first views:
  - chat assisted-draft action,
  - home value/adoption cards,
  - admin configuration export control.
- Add Release 3 e2e coverage for draft generation, value visibility, and usage export.

## Batch 14

- Implement Release 4 typed contracts and adapters for:
  - global governance state and actions,
  - retention policy and data-reuse consent controls,
  - role navigation manifest retrieval.
- Integrate Release 4 runtime behavior in mobile-first and admin surfaces:
  - governance/compliance controls in configuration,
  - navigation manifesto visibility in authenticated home.
- Add Release 4 e2e coverage for governance action, consent update, and navigation manifest.
- Publish Release 3 and Release 4 execution boards and link them from release/integration baselines.

## Batch 15

- Publish external tracker exports for Release 3 and Release 4 boards.
- Update ticketization guide and release execution boards with Release 3/4 export references.
- Add executable remote contract smoke script for Release 3 and Release 4 endpoints.
- Add environment documentation for staging smoke credentials and mutation guardrails.

## Batch 16

- Create `backend/` module with Fastify runtime and domain route surfaces for R1-R4 contract endpoints.
- Define PostgreSQL data model in Prisma schema, generate initial migration SQL, and add seed data for tenants, roles, users, capabilities, tools, cases, compliance, and navigation.
- Add root and backend scripts for backend lifecycle (`backend:*`) and database operations (`db:*`).
- Add Docker Compose for local PostgreSQL and backend runtime bootstrap.
- Validate backend baseline with generate/build/tests and keep frontend CI green.
