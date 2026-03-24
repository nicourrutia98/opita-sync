# Request Specification

## Summary

Implement a real LLM chat workspace for Opita Sync with explicit new chat creation, thread lifecycle controls, retry, per-thread drafts, and visible tool activity.

## Objective

Make the chat operational for real multi-thread workflows without relying on implicit bootstrap creation during first send.

## Business Context

The app already has streaming, cancellation, TTS, and recent thread UI. The gap is lifecycle management and visible thread controls.

## Scope

- backend chat lifecycle endpoints and stream events
- frontend chat workspace, header, sidebar, composer, run status
- remote and stub adapters
- minimum validation and request artifacts

## Out of Scope

- hard delete
- attachments
- message editing
- branching/versioning
- sharing/export

## Confirmed Decisions

- real new chat
- archive first
- inherit selected case
- tool visibility now
- bootstrap only for compatibility

## Accepted Assumptions

- current visual direction remains intact
- thread ordering stays latest activity first

## Affected Systems and Layers

- backend fastify chat routes
- prisma conversation model
- frontend chat components/hooks
- service contracts and adapters

## Functional Behavior

1. Users can create a new real conversation explicitly.
2. Users can rename and archive conversations.
3. Users can retry the last user turn without duplicating user content.
4. Each conversation preserves its own draft.
5. Tool activity is visible during runs.

## Alternate Behavior and Failure Handling

- failures preserve drafts and surface inline error states
- archived conversations are hidden from the main list, not hard deleted

## UI/Content Behavior

- sidebar and header expose thread lifecycle actions
- empty state distinguishes no active chat from empty thread
- run status can expand to reveal tool activity

## Localization Rules

- keep current Spanish product language

## Accessibility Expectations

- new actions remain keyboard reachable
- focus returns to composer after new chat creation

## Observability or Analytics Expectations

- no new analytics required in this phase

## Non-Functional Constraints

- no build after changes
- use cheapest reliable validation first

## Risks and Regressions

- local worker-based test runners may fail with EPERM
- compatibility path must not overshadow new explicit flow

## Acceptance Criteria

1. Explicit create/update/retry conversation operations exist end to end.
2. Chat workspace supports new chat, archive, rename, retry, and per-thread drafts.
3. Tool visibility appears in the run status block.
4. Lint and app typecheck pass.

## Test Strategy

- lint
- root/frontend typecheck
- targeted backend source compile check
- attempt smoke validation where tooling permits

## Rollout and Rollback

- rollout is immediate in current workspace
- rollback is limited to chat backend/frontend files and migration 0003

## Documentation Updates Required

- request artifacts
- validation log
- compliance matrix
- residual risk summary
