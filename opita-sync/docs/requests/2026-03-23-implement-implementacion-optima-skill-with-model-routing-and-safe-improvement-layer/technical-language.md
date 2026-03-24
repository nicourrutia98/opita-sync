# Normalized Technical Language

## Original Intent Translation

Prepare the next implementation with a repo-local skill that chooses the most appropriate Codex launch profile and strengthens the implementation handoff by resolving gaps plus applying one safe improvement.

## Objective

Reduce ad-hoc model choice and improve implementation quality without changing the current active Codex thread or introducing redundant infrastructure.

## In Scope

- a new repo-local skill
- launch-router signal extensions
- stronger recommendation output for next implementation runs
- explicit safe-improvement policy
- tests and docs

## Out of Scope

- active-thread model mutation
- a new MCP server for routing
- online learning or dynamic optimization
- risky “improvements” that expand product scope

## Confirmed Decisions

- routing happens before the next `codex` / `codex exec` launch
- the new skill wraps existing router and translator behavior
- one safe improvement may be applied by default

## Assumptions Accepted by Context

- existing project-scoped Codex profiles remain the real execution surface
- extending the current router is preferable to introducing another policy engine

## Primary Behavior

- classify the upcoming implementation
- summarize current gaps
- apply at most one safe improvement
- translate that context into launch-router inputs
- output the recommended profile, rationale, and exact launch command

## Alternate and Failure Behavior

- if no safe improvement exists, the workflow produces routing plus gap resolution only
- if gaps remain critical, the workflow should route upward and leave the blockers explicit

## UI/Content Requirements

- outputs must distinguish original scope from applied improvement
- recommendations must be compact and executable

## Non-Functional Constraints

- deterministic routing
- no extra network dependencies
- compatibility with current commands and tests

## Acceptance Criteria

1. A new `implementacion-optima` skill exists in the repo.
2. `codex-route` accepts implementation/gap/improvement routing signals.
3. The router returns enriched recommendation metadata for implementation work.
4. Unit tests cover safe-improvement and gap-aware routing.
5. The repo documents the new workflow and packages the skill successfully.

## Risks and Unresolved Non-Blockers

- The skill still depends on humans or future automation to actually launch the next session.
