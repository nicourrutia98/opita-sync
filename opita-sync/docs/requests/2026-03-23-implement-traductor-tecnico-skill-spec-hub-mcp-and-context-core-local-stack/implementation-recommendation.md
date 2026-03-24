# Implementation Recommendation

## Decision

Implement the technical translation stack as a repo-local add-on to the current Opita Sync workflow, not as a separate workspace.

## Why This Is The Best Path

- It reuses the existing Node, TypeScript, request-artifact, and Codex configuration surfaces.
- It keeps the skill editorial and the MCP deterministic.
- It avoids operational sprawl while still producing runnable tooling.

## Immediate Execution Path

1. Materialize the skill with normalized markdown and agent metadata.
2. Add `context-core` manifest and storage contract.
3. Implement the `spec-hub` TypeScript MCP server and tests.
4. Add repo-local scripts, Codex config, and packaging.
5. Validate with a documented end-to-end example.

## Recommended Next Step After This Task

Adopt `traductor-tecnico` plus `spec-hub` as the default intake path for future high-ambiguity engineering requests in this repo.
