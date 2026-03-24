# Implementation Recommendation

## Decision

Use explicit conversation primitives and update the chat workspace around an explicit active thread model.

## Why This Is The Best Path

It resolves the semantic mismatch between implicit bootstrap and real LLM chat behavior without forcing a full redesign.

## Immediate Execution Path

1. Add conversation archive metadata and explicit endpoints.
2. Extend contracts/adapters for create/update/retry/tool events.
3. Update chat workspace, header, sidebar, and run status.
4. Validate with lint, typecheck, and targeted compile checks.

## Recommended Next Step After This Task

Add richer automated UI validation once worker-based test execution is available in the local environment.
