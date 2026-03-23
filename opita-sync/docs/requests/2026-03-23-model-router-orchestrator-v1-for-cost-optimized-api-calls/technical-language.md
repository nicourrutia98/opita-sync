# Normalized Technical Language

## Original Intent Translation

Build a production-capable model router in this repository that chooses an OpenAI model automatically per request, with deterministic rules, controlled fallback behavior, and measurable cost/quality outcomes.

## Objective

Reduce cost per successful request through intelligent routing while preserving quality and latency constraints.

## In Scope

- Node endpoint `POST /ai/orchestrate`
- Deterministic routing policy (`routing-policy.v1`)
- Fallback chain with reason codes
- Request-level telemetry with token and cost estimation fields
- Benchmark/report/calibrate command workflow
- Repo-local skill for repeated operations

## Out of Scope

- Bandit/online learning in V1
- External MCP serving as primary request path
- Deep product UI integration beyond existing control-plane docs

## Confirmed Decisions

- Serving plane: Node service in repo.
- Optimization target: USD/request.
- Selection strategy: rules + score with deterministic outputs.
- MCP role: optional complement, not critical inference path.

## Assumptions Accepted by Context

- Live API calls are optional in CI and enabled only when credentials exist.
- Local estimation and benchmark artifacts are acceptable as primary verification in V1.

## Primary Behavior

For each request, the router evaluates contextual signals, selects an initial model/configuration, executes the response call, evaluates guard outcomes, and escalates through fallback tiers only when needed.

## Alternate and Failure Behavior

- Missing API key: endpoint returns explicit configuration error.
- API timeout or schema/quality guard failure: fallback tier escalation with reason code.
- Exhausted fallback tiers: return structured failure with telemetry and failure reason.

## UI/Content Requirements

- No product UI changes required.
- Documentation and request artifacts must remain auditable and consistent.

## Non-Functional Constraints

- Minimal dependencies
- Deterministic policy execution
- Traceable metrics and policy versioning per request
- Compatibility with existing repo checks

## Acceptance Criteria

- Endpoint contract implemented and documented.
- Policy file and benchmark dataset exist and are versioned.
- Scripts `router:benchmark`, `router:report`, and `router:calibrate` run.
- Unit/integration tests cover routing, fallback, and report generation paths.
- Active request artifacts are complete and marked `specified`.

## Risks and Unresolved Non-Blockers

- Cost estimation can drift from billed cost until reconciled with organization usage APIs.
- Rule thresholds may need tuning after initial benchmark results.
