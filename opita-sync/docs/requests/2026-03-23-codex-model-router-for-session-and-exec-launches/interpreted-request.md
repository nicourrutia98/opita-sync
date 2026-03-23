# Interpreted Request

## Request Summary

Replace the previously implemented API-oriented router with a Codex-oriented launcher workflow that selects the model Codex itself will use for new runs.

## Primary Objective

Implement a repo-local tool that chooses the Codex model/profile before starting a new interactive Codex session or `codex exec` run.

## Expected User-Visible Behavior

- The user can ask the repo to recommend or launch a Codex run with an automatically selected profile.
- The recommendation is deterministic and explainable.
- The command surface makes the limitation explicit: the current live chat cannot mutate its own model in place.

## Likely Affected Surfaces

- `.codex/config.toml`
- `package.json`
- `README.md`
- `scripts/`
- `.agents/skills/`
- `tests/unit/`

## Immediate Ambiguities

- Whether the launcher should change the repo default profile or only create opt-in commands.
- Which model slugs should back the fast and deep profiles.

## Suspected Missing Constraints

- Codex may support `--model` and `--profile`, but current session retargeting is not documented as supported.
- Launch-time automation must work without assuming API keys or an out-of-band MCP server.
