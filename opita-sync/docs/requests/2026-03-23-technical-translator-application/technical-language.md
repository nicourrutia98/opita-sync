# Normalized Technical Language

## Original Intent Translation

Process the current repository request through the Phase 2 technical-translator workflow and use the resulting normalized artifact as the basis for the implementation direction for this task.

## Objective

The request must be represented as a closed, auditable technical artifact before any implementation recommendation or downstream planning is treated as valid.

## In Scope

- Interpret the current user request in technical terms.
- Detect and classify request gaps using the Phase 2 criteria.
- Record whether any major gap requires user intervention.
- Produce a normalized technical-language artifact for this request.
- Audit the normalized artifact.
- If the audit passes, derive the best implementation path for the current project from that artifact.

## Out of Scope

- Inventing a new business feature not named by the user
- Skipping normalization and jumping directly to design or coding
- Asking speculative questions not justified by a major gap
- Expanding beyond the current workflow/control-plane repository without explicit user direction

## Confirmed Decisions

- The Phase 2 translator document is the controlling workflow for this request.
- The implementation direction must not deviate from that document.
- The current project is the target surface for this request.

## Assumptions Accepted by Context

- "Apply it to the current project" refers to the repo's existing workflow/control-plane assets. Low risk because the repository currently centers on that layer.
- "Use it to develop this request" allows downstream specification after a passing Phase 2 audit. Low risk because the Phase 2 document explicitly allows specification expansion only after audit.
- No major-gap questions are needed because the request does not introduce product behavior, business rules, or API decisions. Low risk because all ambiguity is about execution method, not product meaning.

## Primary Behavior

The repo handles this request by producing interpretation, gap classification, normalized technical language, and audit first. After that gate passes, the project's best implementation path is to persist this request as repo artifacts and use those artifacts as the source of truth for any next implementation step.

## Alternate and Failure Behavior

- If the audit finds semantic drift or hidden assumptions, the request must be revised before any specification or coding proceeds.
- If later work introduces product-facing behavior, the translator workflow must reopen gap analysis instead of reusing this artifact unchanged.
- If the user redirects scope to a concrete feature, this artifact becomes historical context rather than the active source of truth.

## UI/Content Requirements

- The resulting artifacts must stay concise, auditable, and non-decorative.
- The wording must separate confirmed decisions from context-based assumptions.
- The implementation direction must be written as a repo/workflow recommendation, not as unsupported product copy.

## Non-Functional Constraints

- Follow the exact Phase 2 ordering.
- Avoid duplicated prose where repo artifacts already define stable formats.
- Keep the output compact enough to remain reusable in later specification and audit steps.
- Do not hide unresolved issues.

## Acceptance Criteria

1. The current request is captured in `docs/requests/<request-id>/interpreted-request.md`.
2. The current request has an explicit gap matrix in `docs/requests/<request-id>/gap-matrix.md` that distinguishes major and minor gaps.
3. The current request has a normalized technical-language artifact in `docs/requests/<request-id>/technical-language.md`.
4. The normalized artifact is audited in `docs/requests/<request-id>/technical-language-audit.md`.
5. If the audit passes, the repo contains an implementation recommendation for this request that is derived from the normalized artifact rather than from raw natural language.

## Risks and Unresolved Non-Blockers

- The phrase "best way to implement it" remains broad, but in the current repo this only affects how far downstream the workflow should be carried, not product behavior.
