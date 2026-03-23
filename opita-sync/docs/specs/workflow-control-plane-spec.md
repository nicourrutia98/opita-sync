# Workflow Control Plane Specification

## Summary

Create the repository operating layer required by the packaged 4-phase engineering workflow and close the remaining deferred repo setup items.

## Objective

Establish a stable repo-level system for request translation, gap management, specification, implementation, QA, compliance, and optimization, backed by real scripts, CI, and browser evidence.

## Business Context

The current repository is a workflow package with no business application code. The highest-value implementation is therefore the control plane itself, plus executable validation of that control plane.

## Scope

- Repo-level guardrails in `AGENTS.md`
- Reusable documentation templates in `docs/`
- Per-request execution artifacts in `docs/requests/<request-id>/`
- Baseline folder structure for specs, decisions, test plans, and QA artifact buckets
- Repo-local Codex configuration and minimal MCP baseline
- Executable npm command surface and GitHub Actions CI
- Local status site for browser, visual, and accessibility validation
- Phase artifacts describing this task from interpretation through optimization

## Out of Scope

- Application features
- Global configuration mutation
- Additional docs MCPs beyond the minimal baseline

## Confirmed Decisions

- Follow phase ordering from the master package.
- Keep the instruction layer short.
- Replace viable staged items with real repo assets.

## Accepted Assumptions

- The workflow layer can justify its own executable validation surface.
- A small local site is enough to exercise browser, layout, and accessibility checks.

## Affected Systems and Layers

- Repo root workflow instructions
- Documentation layer
- Repo-local Codex configuration
- Script and CI layer
- Local validation site

## Functional Behavior

- Future tasks must pass through interpretation, gap detection, technical normalization, spec expansion, implementation batching, QA, and compliance closure.
- The repo must provide reusable templates so later tasks do not repeat prompt boilerplate.
- The repo must preserve request history instead of overwriting generic translator artifacts.
- The repo must expose executable commands that validate the workflow layer itself.
- GitHub Actions CI must execute the same validation surface headlessly.

## Alternate Behavior and Failure Handling

- If a future task adds a business app, the command surface must expand to cover that app without weakening the workflow checks.
- If a future task requires broader docs retrieval, add another docs MCP only by explicit profile decision.

## UI/Content Behavior

- Documentation is concise, auditable, and deterministic.
- No claim of enabled tooling may appear unless the tooling actually exists.
- The status site must remain readable on desktop and mobile.

## Localization Rules

- The workflow may be used for Spanish or English requests; artifacts should remain structurally clear and easy to audit.

## Accessibility Expectations

- For future UI work, the workflow must require focus, labels, responsive checks, and state validation.
- This task includes a small UI artifact specifically to operationalize the browser-validation layer.

## Observability or Analytics Expectations

- Not required beyond normal CI output for this repo state.

## Non-Functional Constraints

- Keep `AGENTS.md` compact.
- Avoid overlapping documentation MCP defaults.
- Preserve low-noise repo structure.
- Keep scripts and CI aligned so local and remote validation do not diverge.

## Risks and Regressions

- Future contributors may add business-app checks and forget to preserve the workflow checks; CI and docs should be updated together.

## Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AC-01 | `AGENTS.md` exists with the required workflow guardrails. |
| AC-02 | Required templates exist under `docs/`. |
| AC-03 | Baseline folders exist for specs, decisions, request history, test plans, Playwright, and QA buckets. |
| AC-04 | Repo-local Codex config exists and the minimal MCP baseline is configured. |
| AC-05 | Executable npm scripts exist for the full validation surface. |
| AC-06 | GitHub Actions CI runs the same validation surface. |
| AC-07 | The local status site is validated by Playwright e2e, visual, and accessibility tests and reflects request-registry state. |
| AC-08 | Phase artifacts and compliance records are updated to reflect the implemented state. |

## Test Strategy

- Verify file existence.
- Review artifact contents against the packaged phase requirements.
- Run the full local command surface through `npm run ci`.
- Confirm no fake executable scripts or false MCP installation claims were introduced.

## Rollout and Rollback

- Rollout: commit the workflow baseline and executable QA surface.
- Rollback: remove the added control-plane files if a different operating model is selected later.

## Documentation Updates Required

- Update the templates, scripts, and `AGENTS.md` when the real application stack is introduced.
