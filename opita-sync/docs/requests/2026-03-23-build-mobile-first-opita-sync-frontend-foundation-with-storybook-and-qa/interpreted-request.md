# Interpreted Request

## Request Summary

Build a professional, mobile-first, low-noise frontend foundation for Opita Sync using only free or open source tools, grounded in the repository product documentation and validated with Storybook and Playwright.

## Primary Objective

Replace the current static status page with an implementable frontend baseline that can evolve into the product UI for Opita Sync, while preserving repository discipline, testability, and documentation.

## Expected User-Visible Behavior

- A mobile-first frontend exists for Opita Sync core flows.
- The UI reflects actor-based navigation and governed operational flows from the existing specs.
- Base components and views are documented in Storybook.
- Playwright validates visible content, responsive behavior, and key UX states.

## Likely Affected Surfaces

- `package.json`
- `tsconfig.json`
- `scripts/build-site.mjs`
- `site/` build output
- `src/` application source
- `.storybook/`
- `stories/`
- `tests/e2e/`
- `tests/visual/`
- `tests/a11y/`
- `docs/specs/opita-sync/frontend-*`

## Immediate Ambiguities

- There is no existing React or Storybook baseline in the repo.
- There is no Penpot source in the repository.
- Current repo tests target a control-plane site, not product UI.

## Suspected Missing Constraints

- No backend contract exists yet, so the frontend foundation must use documented states and mock data.
- No final copy deck exists, so sensitive business text must stay concise and neutral.
