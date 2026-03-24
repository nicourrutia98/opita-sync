# Request Specification

## Summary

Implement a repo-local technical translation subsystem that combines a skill, a shared local context layer, and a deterministic MCP server.

## Objective

Allow future requests in this repository to move from natural language to implementation-ready specifications with traceability and fidelity gates.

## Business Context

The repository already operates with request artifacts, specs, and validation discipline. This feature extends that workflow with reusable technical translation infrastructure instead of ad-hoc chat-only interpretation.

## Scope

- Add `skills/traductor-tecnico/`.
- Add `context-core/`.
- Add `mcp/spec-hub/`.
- Add root scripts and repo-local Codex config for the new MCP.
- Add tests and a documented end-to-end sample flow.

## Out of Scope

- Hosted MCP deployment
- Background indexing services
- Embeddings or vector retrieval
- External source connectors

## Confirmed Decisions

- `stdio` is the default and only committed transport in v1.
- `spec-hub` is local and read-only against the repo.
- The MCP implements only the minimal request surfaces required for tools, resources, and prompts.

## Accepted Assumptions

- Root TypeScript tooling can compile the MCP package.
- Repo-level scripts are the preferred entrypoint for build, test, and packaging actions.

## Affected Systems and Layers

- repo workflow tooling
- Codex project configuration
- request specification discipline

## Functional Behavior

1. The skill provides the editorial translation workflow and fidelity review guidance.
2. `context-core` stores normalized requirements, decisions, specs, reports, and session summaries as stable local artifacts.
3. `spec-hub` exposes MCP tools for normalization, validation, fidelity review, revision diffing, repo grounding, and export.
4. `spec-hub` exposes stable resources and prompts that mirror the pack's reusable content.
5. The repo can package the skill into a distributable archive.

## Alternate Behavior and Failure Handling

- Invalid specs must produce structured validation output, not silent fallback.
- Missing repo matches during grounding are warnings, not crashes.
- Fidelity failures must return `no_listo` or `listo_con_reservas`, never `listo_para_desarrollar`.

## UI/Content Behavior

- Documentation remains concise, auditable, and implementation-facing.
- MCP textual responses include compact summaries plus machine-readable structured output where useful.

## Localization Rules

- Source material and skill documentation may remain in Spanish.
- Runtime outputs may mix Spanish domain terms with English field names where schemas benefit from stable identifiers.

## Accessibility Expectations

- Not user-interface scoped; accessibility requirements apply only to documentation readability and predictable command surfaces.

## Observability or Analytics Expectations

- Validation logs and end-to-end example outputs provide baseline operational evidence.

## Non-Functional Constraints

- Avoid broad new dependencies.
- Keep file access constrained to the repo and `context-core`.
- Preserve compatibility with dirty git worktrees.

## Risks and Regressions

- MCP clients may vary in protocol tolerance; the implementation should stay close to current MCP spec examples.
- Packaging on non-Windows systems may need a fallback archive command.

## Acceptance Criteria

| ID | Criterion |
| --- | --- |
| TS-01 | `skills/traductor-tecnico/` exists with normalized content, references, and agent metadata. |
| TS-02 | `context-core/` exists with manifest, policy, and persistent storage structure. |
| TS-03 | `mcp/spec-hub/` builds and exposes the six planned tools over `stdio`. |
| TS-04 | `.codex/config.toml` includes a repo-local `spec_hub` MCP entry. |
| TS-05 | The repo exposes scripts to build, test, run, and package the stack. |
| TS-06 | Tests cover validation and fidelity regressions, including one failing and one corrected example. |

## Test Strategy

- Compile the MCP package.
- Run unit tests for normalization, validation, fidelity, diff, export, and protocol behavior.
- Package the skill and verify the archive exists.
- Capture an end-to-end example under docs.

## Rollout and Rollback

- Rollout: use the new request artifacts and repo-local MCP configuration as the default technical translation path.
- Rollback: disable the `spec_hub` MCP entry and stop using the new scripts; the feature is additive.

## Documentation Updates Required

- Add runbook and README content for the MCP package.
- Add example request output demonstrating the full flow.
