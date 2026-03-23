# Implementation Recommendation

## Decision

Do not add new MCP configuration. Use the existing repo-local baseline and document it as the operating default for this repository.

## Why This Is The Best Path

The repository already defines a minimal MCP stack with supporting rationale. Reconfiguring beyond that would add noise without solving a demonstrated gap.

## Immediate Execution Path

1. Inspect the repo-local config and policy docs.
2. Validate at least one configured MCP in the current session.
3. Record the decision, assumption, and evidence in the active request artifacts.

## Recommended Next Step After This Task

Use `openaiDeveloperDocs` only for OpenAI/Codex-specific moving documentation, and use `playwright` when UI behavior needs real browser confirmation.
