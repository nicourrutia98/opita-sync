# Request Specification

## Summary

Implement a repo-local skill and launch-router enhancement that chooses the optimal Codex profile for the next implementation and adds a disciplined safe-improvement layer on top of gap resolution.

## Objective

Improve implementation preparation quality and model selection accuracy without adding a redundant router or unsupported Codex mutation behavior.

## Business Context

The repo already has a launch-time Codex router and a technical translation skill. The best path is to combine them into a more opinionated implementation-prep workflow rather than inventing new runtime surfaces.

## Scope

- add `skills/implementacion-optima/`
- extend `scripts/codex-route.mjs`
- extend `scripts/lib/codex-launch-router/router.mjs`
- add or update request artifacts and docs
- expand unit coverage

## Out of Scope

- changing the active chat model in place
- routing through a new MCP
- applying more than one improvement by default

## Confirmed Decisions

- one safe improvement may be applied by default
- current router remains the execution surface
- the new skill acts as an orchestration layer

## Accepted Assumptions

- Codex profiles in `.codex/config.toml` remain valid and stable
- users are willing to launch the next implementation through repo commands

## Affected Systems and Layers

- repo-local skills
- Codex launch routing
- request documentation workflow
- unit tests

## Functional Behavior

1. The skill prepares a next-step implementation handoff.
2. The router accepts implementation, gap, and improvement signals.
3. Routing recommendations include implementation-kind, gap summary, and improvement summary.
4. The workflow keeps original scope separate from applied improvement.

## Alternate Behavior and Failure Handling

- If a safe improvement is not available, the skill does not fabricate one.
- If routing inputs are omitted, current default behavior remains available.

## UI/Content Behavior

- Human-readable output must stay concise and action-oriented.
- JSON output must remain script-friendly.

## Localization Rules

- Skill content may remain in Spanish.
- CLI flags remain English and stable.

## Accessibility Expectations

- Not UI-scoped.

## Observability or Analytics Expectations

- Routing rationale and score remain visible.
- Request artifacts document how the routing context was derived.

## Non-Functional Constraints

- deterministic heuristics only
- no extra runtime dependencies
- backward compatibility with existing commands

## Risks and Regressions

- More routing inputs increase CLI surface area and need documentation discipline.
- If users omit the new signals, recommendation quality will remain closer to the old heuristic level.

## Acceptance Criteria

1. The new skill exists with references and packaging.
2. The router accepts the new routing flags.
3. The router emits enriched recommendation metadata.
4. Unit tests cover new routing behavior.
5. README and request artifacts document the workflow.

## Test Strategy

- targeted router unit tests
- dry-run recommendation with new flags
- skill packaging
- content validation

## Rollout and Rollback

- Rollout is additive and opt-in via the new skill plus existing commands.
- Rollback is limited to removing the new skill, router extensions, and docs.

## Documentation Updates Required

- README command notes
- request artifacts for this feature
- skill references and package output
