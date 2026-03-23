# Request Specification

## Summary

Adopt and document the MCP baseline already configured for this repository so future work uses the intended project-scoped tool surface.

## Objective

Confirm the repo-local MCP configuration, validate that it is usable in the current session, and capture the decision in the active request artifacts.

## Business Context

This repository is designed around a minimal, auditable Codex workflow. Expanding the MCP surface without need would increase ambiguity and maintenance cost.

## Scope

- Inspect `.codex/config.toml`
- Inspect repo docs that define MCP policy
- Validate the current session can use the configured docs MCP
- Record findings, assumptions, and next-step guidance in request artifacts

## Out of Scope

- Adding or removing MCP servers
- Editing global `%USERPROFILE%/.codex/config.toml`
- Running browser-based UI validation unrelated to this request

## Confirmed Decisions

- Project-scoped configuration exists in `.codex/config.toml`.
- The configured servers are `openaiDeveloperDocs` and `playwright`.
- The repository policy remains one docs MCP and one browser MCP only.

## Accepted Assumptions

- The user's request targets the existing repo-local baseline rather than a nonexistent custom repo MCP server.

## Affected Systems and Layers

- Codex project-scoped config
- Repo documentation and request-tracking layer

## Functional Behavior

The agent should use the repo-local MCP baseline as the default operating assumption for this repository and rely on local repo inspection before invoking MCP documentation tools.

## Alternate Behavior and Failure Handling

If a future task reveals a missing project-specific MCP dependency, stop treating the baseline as sufficient and create a new scoped request to evaluate that change.

## UI/Content Behavior

Only request artifacts and the request index are updated in this task.

## Localization Rules

Repo artifacts remain in English for consistency with the existing documentation base.

## Accessibility Expectations

None beyond maintaining clear, readable markdown artifacts.

## Observability or Analytics Expectations

Traceable evidence must include file inspection and at least one MCP tool result.

## Non-Functional Constraints

- Keep the MCP stack minimal
- Avoid redundant configuration changes
- Preserve the single-active-request rule in `docs/requests/index.md`

## Risks and Regressions

- Misinterpreting the request as requiring a new MCP server would create unnecessary scope and config churn.

## Acceptance Criteria

- `docs/requests/index.md` contains exactly one active request
- Request artifacts capture summary, gaps, assumptions, and decision
- Repo-local MCP config is referenced as the source of truth
- A live `openaiDeveloperDocs` MCP call succeeds in this session

## Test Strategy

- Inspect `.codex/config.toml`, `README.md`, and `docs/phase1-foundation-report.md`
- Exercise `openaiDeveloperDocs` MCP with a targeted docs query/fetch
- Run `npm run content` after documentation updates

## Rollout and Rollback

Rollout is immediate because the task is documentation and operating-baseline confirmation only. Rollback is limited to reverting request-artifact edits if the interpretation is later corrected.

## Documentation Updates Required

- Populate the active request artifact set for this task
- Update request status in `docs/requests/index.md`
