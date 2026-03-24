# spec-hub

## Objective

`spec-hub` is a local MCP server that validates, exports, and checks the fidelity of technical specifications generated from natural-language requirements.

## Responsibilities

- normalize requirements
- validate minimum spec structure
- compare source requirements versus generated documentation
- diff revisions
- ground proposed specs against the local repo
- export structured artifacts

## Local workflow

1. `npm run spec-hub:build`
2. `npm run spec-hub:test`
3. `npm run spec-hub:start`

The repo-local Codex config points `spec_hub` at `npm --prefix mcp/spec-hub run start`.

## Example artifacts

See `mcp/spec-hub/examples/` for an ambiguous brief plus failing and corrected documentation samples used to exercise fidelity review.
