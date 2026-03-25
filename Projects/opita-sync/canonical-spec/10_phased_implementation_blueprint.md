# 10. Phased Implementation Blueprint

## Purpose

This blueprint defines the canonical implementation order. It begins with semantics and contracts before concrete technology.

## Phase 0 — Canonical specification freeze
Deliver:
- bounded context map
- domain model
- execution contract
- permission/policy/classification/approval model
- orchestrator architecture
- run state machine
- output control model
- UI/backend alignment
- ADR set

## Phase 1 — Identity, tenant, environment, authority base
Deliver:
- tenant/environment model
- user/role model
- delegation and authority graph
- system identity with human owner
- environment boundaries

## Phase 2 — Governance core
Deliver:
- policy model and decision engine contract
- classification model and handling rules
- explainability artifacts

## Phase 3 — Catalog, assets, lifecycle, publication
Deliver:
- action/workflow domain
- lifecycle enforcement
- immutable publication semantics
- environment publication boundaries

## Phase 4 — Intent and contract system
Deliver:
- intent interpretation artifacts
- contract model
- contract revisioning
- contract editing constraints

## Phase 5 — Admissibility engine
Deliver:
- effective authority evaluation
- policy + classification + environment + publication evaluation
- admissibility decision artifact

## Phase 6 — Capability selection and execution compilation
Deliver:
- approved asset selection
- dynamic composition constraints
- execution plan artifact
- plan checkpoints

## Phase 7 — Durable runtime and approvals
Deliver:
- run state machine implementation
- approval state machine implementation
- waits/retries/resume/callbacks
- inbox integration
- activity/audit integration

## Phase 8 — Output control and release decisions
Deliver:
- release decision engine
- mixed-authority blocking
- redaction path
- hold-for-approval flow
- outbound release control

## Phase 9 — UI surfaces
Deliver:
- Operate
- Catalog
- Inbox
- Activity
- Governance
- Settings

## Phase 10 — Provider and connector integration layer
Deliver:
- provider-neutral AI integration layer
- governed connector invocation layer
- credential/environment isolation

## Phase 11 — Hardening and enterprise readiness
Deliver:
- promotion controls
- evidence completeness
- audit guarantees
- operational review tooling

## Completion rule
No phase may weaken governance to accelerate delivery.
If a shortcut threatens explainability, authority separation, approval semantics, connector perimeter, or output control, the shortcut is rejected.
