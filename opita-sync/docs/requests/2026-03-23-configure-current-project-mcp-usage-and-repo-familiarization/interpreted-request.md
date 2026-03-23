# Interpreted Request

## Request Summary

Configure current project MCP usage and repo familiarization

## Primary Objective

Confirm which MCP servers are actually defined for this repository, adopt that baseline for subsequent work in this thread, and record the decision in request artifacts.

## Expected User-Visible Behavior

The active request should show that the repo-local MCP baseline is understood and usable without adding redundant servers or changing unrelated workflow behavior.

## Likely Affected Surfaces

- `.codex/config.toml`
- `README.md`
- `docs/phase1-foundation-report.md`
- `docs/requests/2026-03-23-configure-current-project-mcp-usage-and-repo-familiarization/`

## Immediate Ambiguities

- Whether "the MCP of the current project" refers to a custom project MCP server or the repo-local Codex MCP baseline.

## Suspected Missing Constraints

- No custom business MCP server definition was found in the repository.
- The low-risk working assumption is that the request refers to the repo-local baseline in `.codex/config.toml`.
