# Normalized Technical Language

## Original Intent Translation

Implement a real LLM-style chat workspace with explicit thread lifecycle and visible agent activity.

## Objective

Replace implicit thread bootstrap as the primary UX path with explicit conversation lifecycle primitives and a frontend that behaves like a modern operational chat workspace.

## In Scope

- explicit create/update/retry conversation primitives
- soft archive
- per-conversation drafts
- rename/archive/new chat actions
- tool visibility in run status
- adapter alignment and minimum validation

## Out of Scope

- hard delete
- attachments
- branching/versioning
- edit message
- share/export

## Confirmed Decisions

- real new chat
- archive first
- inherit selected case on creation
- tool visibility now, without chain-of-thought
- bootstrap stays only as compatibility path

## Assumptions Accepted by Context

- existing chat layout and component naming stay intact where possible
- current run status UI can be extended instead of replaced

## Primary Behavior

Users can create and manage multiple chat threads, each with its own draft, history, retry flow, and archived state.

## Alternate and Failure Behavior

- if create/send/retry/archive fails, surface inline error state and preserve user draft
- if worker-based tests are blocked, rely on cheaper deterministic checks and document the limitation

## UI/Content Requirements

- visible new chat CTA in sidebar and header
- archive and rename controls
- tool activity block must stay compact and collapsible

## Non-Functional Constraints

- no app build after changes
- no delete-hard lifecycle in this phase
- preserve compatibility with existing bootstrap route

## Acceptance Criteria

- explicit conversation lifecycle exists in backend and adapters
- chat workspace no longer depends on null active conversation as the primary creation path
- sidebar/header expose new chat and lifecycle actions
- lint and typecheck pass

## Risks and Unresolved Non-Blockers

- worker-based test execution remains blocked by EPERM in this environment
