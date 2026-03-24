# Interpreted Request

## Request Summary

Create a repo-local skill that prepares the next implementation with the most suitable Codex model/profile, resolves gaps, and applies one safe improvement when it adds clear value.

## Primary Objective

Turn the existing router plus translator workflow into a stronger implementation-prep workflow instead of leaving model choice and low-risk quality improvements to ad-hoc chat judgment.

## Expected User-Visible Behavior

- A new skill exists for implementation preparation.
- The launch router accepts implementation, gap, and improvement signals.
- The repo can recommend the next Codex profile more accurately for implementation work.
- The workflow distinguishes original scope from applied improvement.

## Likely Affected Surfaces

- `skills/implementacion-optima/`
- `scripts/codex-route.mjs`
- `scripts/lib/codex-launch-router/router.mjs`
- `tests/unit/codex-launch-router.test.mjs`
- `README.md`

## Immediate Ambiguities

- None that block implementation. The repo already established that model switching is launch-time only.

## Suspected Missing Constraints

- The new skill should orchestrate existing surfaces instead of creating a second router or a new MCP.
