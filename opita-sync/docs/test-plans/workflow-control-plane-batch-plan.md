# Implementation Batch Plan

| Batch ID | Objective | Files or Surfaces Likely Affected | Dependencies | Risk Level | Validations to Run After the Batch | Acceptance Criteria Touched | Completion Condition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | Create repo guardrails, templates, and folder structure | `AGENTS.md`, `docs/`, `tests/`, `playwright/`, `.docs/` | None | Low | Verify required files and folders exist | AC-01, AC-02, AC-03 | Base control-plane assets exist |
| B2 | Operationalize repo-local tooling, scripts, and CI | `.codex/config.toml`, `package.json`, `tsconfig.json`, `.github/workflows/ci.yml`, `scripts/` | B1 | Medium | Run `lint`, `typecheck`, `unit`, `integration`, and `content` | AC-04, AC-05, AC-06 | Local and CI validation surfaces exist |
| B3 | Add browser-based QA target and validations | `site/`, `playwright.config.ts`, `tests/e2e`, `tests/visual`, `tests/a11y` | B2 | Medium | Run `e2e`, `visual`, and `a11y` | AC-07 | Browser-based evidence exists |
| B4 | Update phase artifacts, compliance, and optimization outputs | `docs/phase1-foundation-report.md`, `docs/requests/index.md`, `docs/requests/<request-id>/`, `docs/specs/workflow-control-plane-spec.md`, `docs/compliance-matrix.md`, `docs/decisions/phase4-optimization-report.md` | B1, B2, B3 | Low | Run `npm run ci` and review doc consistency | AC-08 | All phase outputs reflect the implemented state |
