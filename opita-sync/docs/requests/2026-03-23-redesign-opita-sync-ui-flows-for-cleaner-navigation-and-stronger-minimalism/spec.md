# Request Specification

## Summary

Redesign Opita Sync UI flows to be cleaner, more harmonious, and easier to navigate, with less visible noise and stronger continuity between work surfaces.

## Objective

Improve UX clarity and flow completion without changing service contracts or domain behavior.

## Business Context

The repo already has documented role navigation, mobile-first operational flows, and a visual closure package. The redesign updates how those decisions are presented and grouped in the product UI.

## Scope

- shared shell
- visual primitives
- home
- chat
- cases
- detail
- configuration and control flows

## Out of Scope

- backend changes
- auth/domain contract changes
- new routes beyond the current view model

## Confirmed Decisions

- strong minimalism
- all flows touched
- controlled reopening of the visual direction

## Accepted Assumptions

- current role/view model remains valid
- progressive disclosure is acceptable for secondary context

## Affected Systems and Layers

- frontend shell
- shared UI components
- primary flow surfaces
- UX documentation

## Functional Behavior

1. Navigation becomes cleaner and more role-readable.
2. Each main flow exposes a clearer primary action.
3. Secondary context moves into lighter or collapsible surfaces where possible.
4. Visual emphasis is reduced to the minimum needed for action and trust.

## Alternate Behavior and Failure Handling

- Error, blocked, approval-required, and audited-result states remain explicit.
- Dense context remains reachable when needed, but does not dominate the initial view.

## UI/Content Behavior

- calmer header and footer
- fewer stacked cards
- subtler surfaces
- clearer flow descriptions

## Localization Rules

- Current Spanish UI copy remains acceptable.

## Accessibility Expectations

- Touch targets and readable contrast remain preserved.

## Observability or Analytics Expectations

- No new analytics required.

## Non-Functional Constraints

- maintain current functional view coverage
- preserve current data behavior
- stay compatible with current Vite build and Storybook/Playwright workflow

## Risks and Regressions

- Progressive disclosure can hide context if overused.
- Existing visual baselines may need updates after the redesign.

## Acceptance Criteria

1. Shared shell and primitives reflect the cleaner visual system.
2. Inicio, chat, casos, detalle, and configuracion feel visibly less noisy.
3. The app builds and typechecks after the redesign.
4. Request artifacts document the redesign and validation outcome.

## Test Strategy

- typecheck
- build
- content checks
- browser validation as follow-up evidence if needed

## Rollout and Rollback

- Rollout is immediate in the current frontend.
- Rollback is limited to reverting the UI layer changes.

## Documentation Updates Required

- request artifacts for the redesign
- validation log and residual risk summary
