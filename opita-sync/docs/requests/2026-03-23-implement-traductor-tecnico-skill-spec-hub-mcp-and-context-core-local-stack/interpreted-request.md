# Interpreted Request

## Request Summary

Implement the previously approved plan for a repo-local `traductor-tecnico` skill, a `spec-hub` MCP server, and a shared `context-core` storage layer.

## Primary Objective

Materialize the markdown handoff pack as runnable, repo-scoped assets that fit the existing Opita Sync workflow and Codex integration model.

## Expected User-Visible Behavior

- The repo exposes a real `traductor-tecnico` skill source tree.
- The repo exposes a runnable local MCP server over `stdio`.
- Codex can be configured to start that MCP from repo-local config.
- Request normalization, spec validation, fidelity review, repo grounding, and export have concrete tool behavior.

## Likely Affected Surfaces

- `skills/`
- `context-core/`
- `mcp/spec-hub/`
- `.codex/config.toml`
- `package.json`
- `docs/requests/`

## Immediate Ambiguities

- None that block implementation. The plan already fixed location, scope, packaging, and transport defaults.

## Suspected Missing Constraints

- The MCP should avoid external SDK dependencies unless necessary.
- The implementation should stay read-only against the repo during grounding.
