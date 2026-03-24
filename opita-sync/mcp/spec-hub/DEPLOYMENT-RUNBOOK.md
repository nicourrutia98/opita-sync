# Local deployment runbook

## Recommended mode

Use `stdio` for local Codex integration.

## Steps

1. `npm run spec-hub:build`
2. `npm run spec-hub:test`
3. confirm `.codex/config.toml` contains `spec_hub`
4. start Codex in this repo
5. run an end-to-end example with normalization, fidelity, and export

## Security rules

- do not grant unrestricted filesystem access outside the repo
- keep repo grounding read-only
- do not expose mutating tools in v1
