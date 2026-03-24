# Implementation Optimization

## Implementation Summary

Add a routing-aware implementation-prep skill and extend the Codex launch router so the next implementation run can be started with richer context than prompt length and generic risk alone.

## Resolved Gaps

- Active-thread model switching is unsupported, so the workflow targets launch-time routing only.
- Model selection already exists in the repo, so the new skill wraps that router instead of duplicating it.

## Safe Improvement Applied

- Applied improvement: explicit implementation/gap/improvement routing signals
- Why it is safe: it does not change runtime product behavior, only recommendation quality and auditability
- Expected value: better profile selection for the next implementation and clearer launch rationale

## Residual Risks

- Users must still launch the next session through the repo command surface.
- Heuristic routing remains approximate if the new signals are omitted.

## Next Launch Recommendation

- Use `codex-route` with implementation/gap/improvement flags for the next implementation-prep flow.
