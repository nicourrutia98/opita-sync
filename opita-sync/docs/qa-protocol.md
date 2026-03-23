# QA Protocol

## Required Test Layers

1. Lint
2. Typecheck
3. Unit
4. Integration
5. End-to-end
6. Accessibility
7. Content
8. Visual when UI risk justifies it
9. Compliance review against acceptance criteria

## Frontend-Critical Checks

- Validate loading, empty, error, and success states.
- Validate labels, visible copy, focus order, and actionability.
- Validate responsive behavior at critical breakpoints.
- Validate overflow, clipping, and container fit for primary UI elements.
- Validate wrong-language and placeholder leakage.

## Evidence Expectations

- Capture the minimum sufficient test output.
- Record screenshots or structured browser evidence only when needed.
- Map evidence back to acceptance criteria IDs.

## Failure Handling

- Stop on failed acceptance criteria.
- Record probable root cause and impacted surfaces.
- Re-run only the smallest meaningful validation set after a fix.

## Regression Expectations

- Prefer the cheapest reliable check first.
- Expand to broader checks when risk increases or evidence is weak.
