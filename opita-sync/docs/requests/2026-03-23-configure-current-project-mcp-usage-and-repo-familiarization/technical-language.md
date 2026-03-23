# Normalized Technical Language

## Original Intent Translation

Use the MCP configuration already defined for this repository, verify that it is the active operating baseline, and review the repo documentation needed to work effectively from now on.

## Objective

Work against the repository with the minimal approved MCP stack and leave a traceable decision record.

## In Scope

- Inspect repo-local MCP configuration
- Verify the active baseline through available MCP/tool evidence
- Review local documentation relevant to that baseline
- Update request artifacts with findings and assumptions

## Out of Scope

- Adding new MCP servers
- Changing global user configuration
- Modifying product behavior, UI, or tests unrelated to this request

## Confirmed Decisions

- The repo-local MCP baseline is `openaiDeveloperDocs` plus `playwright`.
- No custom project-specific MCP server is defined in this repository.
- The baseline should be used selectively, not habitually.

## Assumptions Accepted by Context

- "Use the current project MCP" means "use the MCP baseline declared in `.codex/config.toml` for this repo."

## Primary Behavior

Subsequent work in this repository should treat `.codex/config.toml` as the project-scoped MCP source of truth.

## Alternate and Failure Behavior

If a future task requires a custom or additional MCP server, that change should be handled as a separate explicit request with updated docs and validation.

## UI/Content Requirements

None for product UI. Request artifacts must remain clear and auditable.

## Non-Functional Constraints

- Keep exactly one active request in the index
- Prefer the smallest MCP surface that materially improves work quality
- Keep documentation changes limited to the request artifact set unless behavior changes

## Acceptance Criteria

- Active request artifacts record the MCP decision and assumption set
- The repo-local MCP baseline is identified from source files
- At least one configured MCP is validated through an actual MCP tool call
- No redundant MCP configuration is introduced

## Risks and Unresolved Non-Blockers

- Playwright MCP was not exercised against a page in this request, only retained as the browser-validation baseline for future UI work
