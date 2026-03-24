# Normalized Technical Language

## Original Intent Translation

Build a repo-local technical translation stack that turns natural-language requirements into structured specs and verifies fidelity before implementation, while fitting the existing Opita Sync workflow discipline.

## Objective

Provide a minimal but runnable local system composed of:

- a `traductor-tecnico` skill
- a shared `context-core`
- a `spec-hub` MCP server

## In Scope

- skill source and packaging
- local context manifest and storage contract
- MCP tools for normalization, validation, fidelity, diff, repo grounding, and export
- repo-local Codex configuration
- tests and end-to-end example artifacts

## Out of Scope

- remote MCP hosting
- vector search
- external repo/ticket integrations
- automatic repo mutation from MCP tools

## Confirmed Decisions

- `spec-hub` runs over `stdio`.
- `spec-hub` is implemented in TypeScript.
- `context-core` is filesystem-backed in v1.
- the implementation lives inside the current repo.

## Assumptions Accepted by Context

- The current repo-level `tsc` install is sufficient to build the MCP package.
- A minimal MCP implementation without an external SDK is acceptable for v1.

## Primary Behavior

- Normalize free-form requirements into atomic technical units.
- Validate structured specs for minimum completeness.
- Compare source requirements with generated documentation and issue a fidelity verdict.
- Compare revisions for semantic drift.
- Ground proposed specs against the local repo in read-only mode.
- Export structured specs into markdown, json, or yaml.

## Alternate and Failure Behavior

- Invalid tool inputs produce deterministic validation errors.
- Unknown resources or prompts return MCP errors.
- Fidelity blockers prevent a ready verdict.

## Non-Functional Constraints

- Keep the MCP local, deterministic, and read-only against the repo.
- Preserve request-traceable evidence in docs.
- Keep the skill editorial and the MCP operational.

## Acceptance Criteria

- All six MCP tools are discoverable and callable.
- The skill exists with references and agent metadata.
- `context-core` persists and retrieves artifacts.
- An example failing fidelity case is detected.
- An example corrected case passes.
