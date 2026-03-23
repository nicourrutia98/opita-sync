# Request Specification

## Summary

Implement V1 of a Node-based intelligent model router that orchestrates OpenAI Responses API calls for lower cost per successful request with deterministic routing, fallback controls, and benchmark-backed evidence.

## Objective

Reduce USD/request by routing to economical models first while protecting quality and latency through explicit guards and escalations.

## Business Context

This repo already provides an executable control plane. The requested feature extends that control plane with an operational AI-serving subsystem and measurable optimization workflow.

## Scope

- Create `model-router` module with `route` and `execute` contracts.
- Add internal serving endpoint `POST /ai/orchestrate`.
- Add versioned policy file and benchmark dataset.
- Add telemetry capture and cost estimation.
- Add benchmark/report/calibrate scripts and npm command surface entries.
- Add repo-local skill for repeatable operations.
- Add tests and documentation updates required by existing checks.

## Out of Scope

- Adaptive online bandit routing.
- Mandatory live billing API reconciliation in CI.
- Replacing existing MCP baseline.

## Confirmed Decisions

- Router policy is deterministic and versioned.
- Fallback chain has at least two escalation tiers and explicit reason codes.
- The service is implemented with native Node HTTP/fetch instead of new server framework dependencies.

## Accepted Assumptions

- OpenAI API credentials may be absent in some environments; scripts must degrade gracefully.
- Local cost estimation is sufficient for V1 acceptance when live reconciliation is unavailable.

## Affected Systems and Layers

- New orchestration service and routing library in `scripts/`.
- Existing command surface and documentation.
- Unit/integration test suites.
- Repo-local skills surface.

## Functional Behavior

- `route(request_context)` returns selected model, reasoning effort, service tier, policy version, and rationale codes.
- `execute(request_context)` performs API call(s), applies fallback policy, and returns response plus telemetry.
- Endpoint returns `answer` and `orchestration` payload fields.
- Benchmark command runs A/B (baseline fixed model vs router) against benchmark set and writes run artifacts.
- Report command summarizes comparative metrics and go/no-go decision.
- Calibrate command updates tunable thresholds from benchmark outcomes under deterministic rules.

## Alternate Behavior and Failure Handling

- If no API key is configured, endpoint and live benchmark fail with explicit actionable errors.
- If network/API failures occur, fallback attempts proceed by policy until exhausted.
- If fallback exhaustion occurs, response includes structured failure telemetry.

## UI/Content Behavior

- No user-facing frontend changes required.
- README and request artifacts must include command references and traceability details.

## Localization Rules

Core technical artifacts remain in English to align with repository conventions.

## Accessibility Expectations

Not applicable to product UI for this request.

## Observability or Analytics Expectations

- Telemetry includes token usage, latency, model/service tier, fallback count, and estimated cost.
- Optional reconciliation hooks for organization usage/cost APIs.
- Benchmark artifacts include per-run metrics and confidence summaries.

## Non-Functional Constraints

- Keep implementation dependency-light.
- Maintain strict deterministic policy behavior for identical inputs.
- Ensure compatibility with current lint/typecheck/unit/integration/content checks.

## Risks and Regressions

- Initial heuristics may underperform on unseen task distributions.
- Estimated costs may diverge from billing until reconciliation is enabled.
- Additional scripts increase maintenance overhead if undocumented.

## Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AC-R1 | Endpoint `POST /ai/orchestrate` implemented with required request/response contract. |
| AC-R2 | Versioned policy file `routing-policy.v1` exists with explicit thresholds and model mapping. |
| AC-R3 | Benchmark dataset `benchmark-set.v1` exists with labeled cases and quality expectations. |
| AC-R4 | `route` and `execute` contracts implemented and tested. |
| AC-R5 | Fallback reasons are captured (`quality_guard_fail`, `schema_fail`, `timeout`, etc.). |
| AC-R6 | Telemetry includes all required metrics and estimated cost field. |
| AC-R7 | NPM scripts `router:benchmark`, `router:report`, `router:calibrate` exist and run. |
| AC-R8 | Repo-local skill exists for repeated benchmark/report/calibration workflows. |
| AC-R9 | Verification artifacts show baseline-vs-router comparison and decision. |

## Test Strategy

- Unit tests: routing score behavior, fallback triggers, telemetry aggregation, report metric computations.
- Integration tests: endpoint contract and benchmark/report pipeline on deterministic mock adapter.
- Typecheck and lint across new modules.
- Content checks for updated command surface and active-request status.

## Rollout and Rollback

- Rollout via incremental merge of router modules, service, scripts, tests, docs, and skill.
- Rollback by removing the router subsystem files and script entries if V1 fails acceptance.

## Documentation Updates Required

- Update README command surface section.
- Update request artifact set with final evidence and compliance mapping.
- Add usage notes for service endpoint, benchmark, report, and calibrate commands.
