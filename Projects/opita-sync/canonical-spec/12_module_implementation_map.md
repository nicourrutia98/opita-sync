# 12. Canonical Module Implementation Map

## Purpose

This document translates the canonical product architecture into implementable modules and boundaries.

## Module map

### Module: identities
Purpose:
- tenants
- users
- memberships
- environments
- system identities

Inbound dependencies:
- application
- authority
- orchestrator

Outbound dependencies:
- none beyond shared kernel / domain

Key outputs:
- identity facts
- tenant context
- environment context
- system identity ownership facts

### Module: authority
Purpose:
- delegation
- relationship graph
- effective authority

Key outputs:
- effective authority artifact
- on-behalf-of resolution
- separated permissions for view/use/draft/apply/send/approve/delegate

### Module: policy-engine
Purpose:
- policy model
- policy evaluation
- precedence resolution
- explainability

Key outputs:
- policy decision artifact
- obligations
- deny reasons
- matched rule trace

### Module: classification
Purpose:
- classification schemes
- handling rules
- mixed-authority inputs

Key outputs:
- classification evaluation artifact
- handling obligations
- release restrictions

### Module: catalog
Purpose:
- actions/workflows
- lifecycle
- publication
- semantic immutability

Key outputs:
- asset metadata
- publication status
- approval mode metadata
- compatibility/breaking-change semantics

### Module: contracts
Purpose:
- execution contract
- contract revisions
- constraints
- normalization DTOs

Key outputs:
- contract artifact
- contract revision diff
- admissibility input package

### Module: orchestrator
Purpose:
- intent interpretation coordination
- contract assembly coordination
- admissibility orchestration
- capability selection
- plan compilation

Key outputs:
- interpreted intent artifact
- contract candidate
- admissibility request
- execution plan

Important restriction:
- orchestrator coordinates, but final authority still resides in explicit policy/classification/authority decisions

### Module: runtime
Purpose:
- run creation
- step execution state
- retries
- waits
- callbacks
- pause/resume

Key outputs:
- run state changes
- step events
- execution completion evidence

### Module: approvals
Purpose:
- approval case lifecycle
- approver assignment
- approval transitions
- resume trigger

Key outputs:
- approval decisions
- pause/resume instructions

### Module: output-control
Purpose:
- release decision
- redaction path
- hold/block logic
- mixed-authority enforcement

Key outputs:
- release decision artifact
- redacted release artifact if allowed
- block reason artifact

### Module: inbox
Purpose:
- actionable work items

Key outputs:
- approvals pending list
- intervention-needed items
- release-review tasks

### Module: audit
Purpose:
- immutable event record
- decision and evidence references

Key outputs:
- audit event stream
- evidence bundles
- activity query model

### Module: connectors
Purpose:
- governed connector invocation contracts
- connector metadata and scopes
- credential references

Key outputs:
- connector capability descriptors
- allowed invocation context

Restriction:
- connector invocation must happen only from compiled plan/runtime boundaries

### Module: provider-adapters
Purpose:
- model provider abstraction
- OpenAI/Anthropic/Gemini adapter implementations

Restriction:
- providers may support interpretation/planning tasks but may not own governance semantics

## Cross-module artifacts

### EffectiveAuthorityArtifact
Produced by:
- authority
Used by:
- policy-engine
- orchestrator
- output-control

### AdmissibilityDecisionArtifact
Produced by:
- orchestrator + policy-engine + classification + authority
Used by:
- contract UI
- compiler
- audit

### ExecutionPlanArtifact
Produced by:
- orchestrator
Used by:
- runtime
- approvals
- output-control checkpoints
- audit

### RunSnapshot
Produced by:
- runtime
Used by:
- activity
- output-control
- audit

### ReleaseDecisionArtifact
Produced by:
- output-control
Used by:
- Operate UI
- Activity
- audit
- outbound delivery layer

## Critical anti-corruption rules
- UI must never synthesize authority decisions locally
- provider adapters must never bypass output-control
- connectors module must not expose arbitrary freeform execution APIs to chat surfaces
- Settings module must not mutate governance rules
- Catalog module must not implicitly grant execution rights

## Recommended build order
1. identities
2. authority
3. policy-engine
4. classification
5. audit
6. catalog
7. contracts
8. orchestrator
9. runtime
10. approvals
11. output-control
12. inbox
13. connectors
14. provider-adapters
15. ui-core / ui-opita / web
