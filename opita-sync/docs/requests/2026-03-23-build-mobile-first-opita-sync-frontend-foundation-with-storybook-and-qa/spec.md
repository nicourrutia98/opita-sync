# Request Specification

## Summary

Build a professional, mobile-first frontend foundation for Opita Sync, then harden it into a production-ready release surface with typed service adapters, runtime configuration, and CI-complete validation.

## Objective

Create the first sustainable UI implementation layer for Opita Sync inside this repository.

## Business Context

The repository already contains a structured product specification for Opita Sync, but no application-grade frontend implementation. The gap is now architectural and delivery-oriented: translate the product model into a reusable UI system and initial views.

## Scope

- Frontend audit and stack decision
- React/Vite application foundation
- Mobile-first component system
- Priority Opita Sync views
- Supervisor workspace
- Light and dark theme support
- Runtime branding integration with Flow Grid v3 and proposed app icon
- Typed service adapter layer and runtime environment config
- Full login flow with persisted bearer session and password reset surfaces
- Tenant-scoped bootstrap of authenticated identity, role, and allowed views
- Connected loading, empty, error, success, and retry states
- Legacy compatibility cleanup for active `test/check/build` naming and validation sources
- Integration master planning for full 4-release closure
- Contract-first release gating and extended staging regression baseline
- Release 1 execution backlog board with dependency-ordered tickets
- Release 2 execution backlog board with dependency-ordered tickets
- External tracker ticketization package for Release 1 and Release 2 execution boards
- Release 2 runtime integration for Bitacora Operativa, Catalogo de Capacidades, Gobierno de Herramientas, and Parametrizacion del Tenant
- Release 3 runtime integration for Borradores Asistidos, Reporting de Valor y Export de Consumo para billing externo
- Release 4 runtime integration for Administracion Opita Code, Compliance/Retencion y manifiesto de navegacion por rol
- Ticketizacion externa completada para Release 1 a Release 4
- Smoke remoto contract-first para endpoints de Release 3 y Release 4 listo para staging
- Backend productivo dentro del repo con `Node + Fastify + Prisma + PostgreSQL` para contratos R1-R4
- Release metadata and package identity hardening
- Self-contained CI compatibility inside `opita-sync/`
- Storybook documentation
- Frontend architecture docs
- Playwright validation updates

## Out of Scope

- Native mobile runtime
- Final billing workflows

## Confirmed Decisions

- Use a web React stack with mobile-first behavior.
- Storybook is mandatory for component documentation.
- Playwright remains the primary validation tool.
- Penpot is unavailable; repo docs will serve as design grounding.
- Flow Grid v3 is the runtime lockup for product identity surfaces.
- A custom app icon will be proposed from scratch and used as the shell/favicon source.
- Supervisor workspace is the next priority view.
- Light and dark themes are part of the baseline, not a later add-on.
- Frontend runtime data must come through `OpitaAppServices`, not direct imports from mock files.
- Remote integration remains optional in this batch; a stub adapter stays available as a controlled fallback.
- Login is `email + password` with persisted bearer token in browser storage.
- Tenant and role resolve server-side during authenticated bootstrap.
- Active release checks should validate Opita Sync artifacts, not legacy control-plane aliases.
- Full integration closure will follow the 4-release modular sequence already defined in product docs.
- Release closure requires CI plus extended staging regression (e2e, visual, a11y, remote contract smoke).

## Accepted Assumptions

- Backend endpoints may still be incomplete; the frontend must remain deployable with stub adapters.
- Tailwind-based open-code components provide the best balance of speed and sustainability.

## Affected Systems and Layers

- package management and build pipeline
- app source and stories
- service contracts, adapters, and env config
- UI tests
- Opita Sync frontend docs

## Functional Behavior

- The application should expose an operational mobile-first shell, priority workflows, and role-based navigation.
- The UI should clearly present cases, chat, detail views, and governance surfaces.
- The UI should include empty, loading, error, and success states for documented views.
- The UI should resolve dashboard, cases, case detail, chat state, and tenant config through an injected service contract.
- The UI should expose login, password reset request, password reset confirmation, and sign-out.
- The app should rehydrate persisted session state before entering the operational shell.
- Users should be able to retry transient module failures without reloading the full app.
- The shell should support light and dark themes without changing information architecture.
- Supervisor must have a dedicated home surface for approvals, blockers, and escalations.

## Alternate Behavior and Failure Handling

- If Storybook cannot be served in CI later, its static build should still be generated locally.
- If remote calls fail and fallback is enabled, the app should return controlled stub data rather than crash the shell.
- If backend contracts change, adapters should absorb the change without rewriting primitives or views.
- If a protected request returns `401`, the app should clear session and route back to login with an expired-session message.
- If a protected request returns `403`, the app should keep session and show visible access denial.

## UI/Content Behavior

- Mobile-first hierarchy
- Clear CTA structure
- Low-noise, operational language
- Consistent tokens and spacing
- Runtime branding limited to safe identity surfaces

## Localization Rules

- Spanish product language is preferred in visible product UI.

## Accessibility Expectations

- Keyboard-accessible navigation
- Discernible controls
- Visible focus
- No serious or critical axe violations in validated flows

## Observability or Analytics Expectations

- Not required for this batch beyond stable QA evidence.

## Non-Functional Constraints

- Open source only
- Reusable component architecture
- Testable output

## Risks and Regressions

- Replacing the legacy static page will require test migration.
- Storybook setup adds dependency surface that must stay version-coherent.

## Acceptance Criteria

| ID | Criterion |
| --- | --- |
| FE-01 | The repo contains a justified frontend stack decision and architecture docs. |
| FE-02 | The repo contains a mobile-first React frontend baseline for Opita Sync. |
| FE-03 | Core primitives and priority views are documented in Storybook. |
| FE-04 | Playwright validates the new frontend for visible content, accessibility, and responsive behavior. |
| FE-05 | Request artifacts include compliance evidence and residual risks. |
| FE-06 | The frontend includes implemented light and dark themes and a dedicated supervisor workspace. |
| FE-07 | Flow Grid v3 usage and the proposed app icon are documented and integrated into the runtime shell. |
| FE-08 | The app consumes runtime data through `OpitaAppServices` and not direct mock imports in views. |
| FE-09 | Home, cases, case detail, and supervisor workspace expose loading, empty, error, and retry behavior through connected services. |
| FE-10 | Release metadata, env configuration, and CI validation are updated to represent `Opita Sync` as the shipped package. |
| FE-11 | The frontend implements full login flow, session persistence, and sign-out through `authService`. |
| FE-12 | The frontend handles authenticated bootstrap, `401` session expiration, and `403` access denial with documented UI states. |
| FE-13 | Active test/check/build paths no longer depend on `control-plane` aliases; validation source is Opita-specific. |
| FE-14 | The repo contains a release-by-release integration master plan aligned to Opita Sync modules and dependencies. |
| FE-15 | The repo contains a release-by-release test and regression plan with contract-first and CI + extended staging gates. |
| FE-16 | The repo contains an actionable Release 1 execution board split by contracts, UI, audit, and tests with explicit dependencies and done gates. |
| FE-17 | The repo contains an actionable Release 2 execution board split by contracts, UI, audit, and tests with explicit dependencies and done gates. |
| FE-18 | The repo contains import-ready external tracker ticketization for Release 1 and Release 2 boards. |
| FE-19 | Release 2 runtime surfaces are integrated through typed services with governed mutations, audit IDs, and validated states for detail and configuration views. |
| FE-20 | Release 3 runtime surfaces are integrated through typed services for assisted drafts, value/adoption metrics, and tenant-attributed usage export with validated states and audit evidence. |
| FE-21 | Release 4 runtime surfaces are integrated through typed services for global governance actions, compliance retention/consent controls, and role navigation manifesto with validated states and audit evidence. |
| FE-22 | The repo contains import-ready external tracker ticketization for Release 3 and Release 4 boards. |
| FE-23 | The repo includes an executable remote contract smoke for Release 3 and Release 4 endpoints with environment-driven staging credentials and mutation guardrails. |
| FE-24 | The repo includes a runnable backend module with PostgreSQL schema, migrations, and seed covering Opita Sync contracts R1-R4. |
| FE-25 | Root operations include reproducible backend and DB scripts (`backend:*`, `db:*`) and the backend contracts are locally testable. |

## Test Strategy

- Run content and lint checks.
- Run typecheck if TS config supports the new app.
- Run unit and integration checks after release hardening.
- Run Playwright e2e, visual, and a11y against the new site.

## Rollout and Rollback

- Rollout by building the app into `site/`.
- Rollback by restoring the prior static site and related tests if needed.

## Documentation Updates Required

- Keep frontend architecture docs and Storybook aligned with implementation changes.
- Keep integration and test-planning docs aligned with release execution evidence.
