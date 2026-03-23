# Implementation Recommendation

## Decision

Implement a launch-time Codex router backed by project profiles, not an API-call router and not a standalone MCP server.

## Why This Is The Best Path

Official Codex docs expose `--model`, `--profile`, project-scoped `.codex/config.toml`, and repo-local skills as the supported customization surfaces. No documented path was found to hot-swap the current active thread model. A launcher router is therefore the highest-leverage solution that is both real and maintainable.

## Immediate Execution Path

1. Add Codex profiles to `.codex/config.toml`.
2. Implement a deterministic router and command builder in `scripts/`.
3. Expose `npm` commands for recommendation and launch.
4. Add a repo-local skill that uses the launcher.
5. Validate with dry runs and static checks.

## Recommended Next Step After This Task

If the workflow proves useful, a future iteration can add shell aliases, desktop shortcuts, or automation around `codex-route.mjs` so more sessions naturally start through the router.
