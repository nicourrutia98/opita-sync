# Opita Sync Integration and Regression Plan

## Test Strategy

Validate each release with a contract-first baseline, then layer runtime behavior, UI continuity, and evidence integrity. Passing CI is necessary but not sufficient; staging regression and traceability evidence are required for closure.

## Mandatory Test Pack per Release

### 1) Contract Tests

- Validate request and response schemas for the release endpoint set.
- Validate backward compatibility for already published contracts.
- Validate error-family mapping for 401, 403, 422, and 5xx.
- Validate tenant and role fields where required by the module.

### 2) Unit + Integration Tests

- Permission and visibility rules by role and tenant.
- Policy mode behavior (suggest, confirm_then_execute, blocked path).
- State transitions and guards for module entities.
- Audit event completeness and correlation IDs.

### 3) E2E Playwright

- Primary flows by role:
  - mobile-first: solicitante, tecnico, supervisor,
  - web-first: admin tenant and Opita Code where surfaced.
- Mandatory UI states:
  - loading,
  - empty,
  - error,
  - success.
- Session lifecycle:
  - login,
  - sign-out,
  - 401 handling,
  - 403 handling.

### 4) Accessibility

- Axe checks on login/auth shell, app shell, and new release surfaces.
- Keyboard and focus visibility checks on primary interaction paths.

### 5) Visual Regression

- Mobile and desktop snapshots on modified surfaces.
- Overflow and clipping guard checks on key layouts.

### 6) Data Integrity Checks

- Operational event to audit event consistency.
- Audit events to reporting and consumption metrics consistency.
- Tenant attribution consistency for all release entities.

## Release-by-Release Test Focus

### Release 1 Focus

- Auth/session contract, case operations, chat orchestration, and audit baseline.
- Critical role-visibility enforcement and suggest/confirm/execute traceability.

### Release 2 Focus

- Bitacora event quality, evidence visibility, capability enablement, tool policy enforcement, and tenant config guardrails.

### Release 3 Focus

- Draft approval branches, reporting slices, and usage attribution export consistency.

### Release 4 Focus

- Global governance actions, retention and segregation behavior, and final navigation continuity by role.

## Exit Criteria per Release

A release is closed only if all conditions are true:

1. `npm run ci` passes.
2. Staging extended regression passes:
   - e2e,
   - visual,
   - a11y,
   - remote contract smoke tests.
3. Evidence artifacts are updated in the active request:
   - `validation-log.md`,
   - `compliance-matrix.md`,
   - `residual-risk-summary.md`.
4. Rollback criterion and trigger are documented.

## Failure Handling Policy

- Any contract regression blocks release progression.
- Any tenant-visibility violation blocks release progression.
- Any missing audit trail for sensitive mutations blocks release progression.
- Any unresolved serious or critical accessibility issue on affected release surfaces blocks release progression.

