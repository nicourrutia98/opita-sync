# Compliance Matrix

| Criterion ID | Acceptance Criterion | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| AC-01 | `AGENTS.md` exists with the required workflow guardrails. | `AGENTS.md` present with gap, implementation, frontend, testing, and closure sections | Pass | Guardrail layer is short and stable |
| AC-02 | Required templates exist under `docs/`. | `docs/spec-template.md`, `docs/gap-matrix-template.md`, `docs/technical-language-template.md`, `docs/audit-template.md`, `docs/compliance-matrix-template.md`, `docs/qa-protocol.md` | Pass | Templates are reusable and concise |
| AC-03 | Baseline folders exist for specs, decisions, request history, test plans, Playwright, and QA buckets. | `.docs/`, `docs/requests/`, `docs/specs/`, `docs/decisions/`, `docs/test-plans/`, `playwright/`, `tests/e2e/`, `tests/content/`, `tests/visual/`, `tests/a11y/` | Pass | Structure now preserves per-request history |
| AC-04 | Repo-local Codex config exists and the minimal MCP baseline is configured. | `.codex/config.toml`, `%USERPROFILE%/.codex/config.toml`, `codex mcp get openaiDeveloperDocs --json`, `codex mcp get playwright --json` | Pass | One docs MCP and one browser MCP only |
| AC-05 | Executable npm scripts exist for the full validation surface. | `package.json`, `scripts/build-site.mjs`, `scripts/lint.mjs`, `scripts/content-check.mjs` | Pass | Commands run locally |
| AC-06 | GitHub Actions CI runs the same validation surface. | `.github/workflows/ci.yml` | Pass | CI mirrors local `npm run ci` |
| AC-07 | The local status site is validated by Playwright e2e, visual, and accessibility tests. | `site/index.html`, `playwright.config.ts`, `tests/e2e/control-plane.spec.ts`, `tests/visual/control-plane.visual.spec.ts`, `tests/a11y/control-plane.a11y.spec.ts` | Pass | Browser evidence now reflects request registry state |
| AC-08 | Phase artifacts and compliance records are updated to reflect the implemented state. | `docs/phase1-foundation-report.md`, `docs/requests/index.md`, `docs/requests/2026-03-23-technical-translator-application/`, `docs/specs/workflow-control-plane-spec.md`, `docs/test-plans/workflow-control-plane-batch-plan.md`, `docs/decisions/phase4-optimization-report.md` | Pass | Docs and implementation are synchronized |

## Residual Risks

- `codex mcp list` did not reflect configured servers during setup even though direct lookup and config files did.
- If the repo later gains a business application, these workflow checks must be preserved while the app-specific checks are added.
