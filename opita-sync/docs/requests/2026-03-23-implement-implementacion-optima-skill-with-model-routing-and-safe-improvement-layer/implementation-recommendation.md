# Implementation Recommendation

## Decision

Implement `implementacion-optima` as a skill that wraps the existing translator and launch router, while extending the router with implementation-specific signals.

## Why This Is The Best Path

- It uses the repo surfaces that already exist and are real.
- It avoids a second router or unsupported active-thread mutation.
- It keeps safe improvement disciplined and explicit.

## Immediate Execution Path

1. Add the skill.
2. Extend router inputs and scoring.
3. Add tests and docs.
4. Validate with dry-run routing and packaging.

## Recommended Next Step After This Task

Use this skill when a request is already understood and the next question is how to prepare the strongest implementation handoff and launch context.
