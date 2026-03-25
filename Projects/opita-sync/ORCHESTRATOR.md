# Opita Sync — Orchestrator Architecture Rationale for Codex

## Purpose of this document

This file explains **how the orchestrator should be conceived** for Opita Sync and, more importantly, **why**.

This is not a framework-specific implementation plan.
It is the architectural intent Codex must preserve.

---

## Short answer

The best orchestrator for Opita Sync is **not** a free agent loop.

It should be a **contract-first, policy-compiled orchestration system** with these conceptual layers:

- intent interpretation
- contract construction
- authorization and policy evaluation
- action/workflow selection from approved catalog only
- plan compilation
- durable execution runtime
- approval pauses and resumptions
- output control and release decision
- full audit trail

The LLM participates in interpretation and planning.
The platform retains authority over execution.

---

## Why this is the right architecture for this product

Opita Sync is trying to maximize:
- governance of actions
- governance of information
- controlled external effects
- enterprise auditability
- policy consistency across multitenant boundaries

A free-running agent loop is a poor fit because it tends to blur:
- intent vs authority
- planning vs permission
- retrieval vs disclosure
- draft generation vs final application
- tool availability vs tool authorization

For Opita Sync, those must stay distinct.

---

## The orchestrator's job

The orchestrator is responsible for converting a user's request or an event into a **governed execution outcome**.

That means it must answer, in order:

### 1. What is being asked?
Interpret the user's intent or the incoming event.

### 2. What is the normalized contract?
Represent the request in structured terms:
- objective
- scope
- allowed data
- allowed connectors
- delegation context
- approvals
- allowed final effect
- expected output

### 3. Is this allowed?
Evaluate effective permissions, relationships, policy, classification, environment, asset lifecycle, and connector boundaries.

### 4. Which approved capability should be used?
Choose only from published, allowed actions/workflows.

### 5. What exact plan should run?
Compile a deterministic or constrained plan from allowed building blocks.

### 6. How should it execute?
Run durably, pause when approvals are needed, resume safely, handle retries and external latency.

### 7. Can the result be released?
Apply output controls before user-visible disclosure or external effect.

### 8. What must be recorded?
Persist the decision path, approvals, policy version, plan, and outcome.

---

## The orchestrator must not do these things

### It must not treat the LLM as the source of authority
The model may suggest.
The system must decide.

### It must not allow arbitrary tool use
Every tool-like capability must map to a governed action or workflow.

### It must not bypass contract normalization
Raw prompts are not executable truth.

### It must not collapse retrieval and release into one step
Allowed context does not automatically mean allowed final output.

### It must not use hidden agent memory as the governance mechanism
Governance belongs in explicit policy and explicit state.

---

## Recommended conceptual architecture

## Layer 1 — Intent Interpreter
Purpose:
- understand a user request or event
- classify broad request type
- identify ambiguities
- propose a candidate contract

This layer is where the LLM is most useful.

Important:
This layer does not decide permissions.

### Inputs
- user message or event payload
- user identity
- tenant identity
- current environment
- visible catalog surface
- current conversation context if applicable

### Outputs
- normalized candidate contract
- confidence / ambiguity markers
- candidate action families

---

## Layer 2 — Contract Builder
Purpose:
- transform the candidate request into the user-facing contract object
- expose editable fields to the user when needed
- apply platform defaults
- fill missing fields with safe defaults when policy permits

This layer owns the canonical execution intent object.

### Contract fields
The contract must explicitly model at least:
- objective
- scope
- allowed data
- allowed connectors
- delegation context
- approval mode
- allowed final action
- desired output form

Optional fields may be added later, but these are core.

---

## Layer 3 — Authorization and Policy Evaluator
Purpose:
- compute whether the requested contract is allowed
- compute what must be restricted, escalated, or blocked
- determine effective permissions and obligations

This layer should evaluate:
- RBAC
- ABAC
- ReBAC / delegation
- classification handling rules
- tenant policy
- jurisdiction policy
- area/function policy
- environment constraints
- asset lifecycle state
- connector availability
- approval requirements

### Important
This layer may return more than allow/deny.
It may return:
- allow
- allow with obligations
- require approval
- require redaction
- restrict connector set
- restrict data set
- deny

---

## Layer 4 — Capability Selector
Purpose:
- map the contract to one or more approved assets

Allowed assets:
- approved actions
- approved workflows
- correct environment publication state
- correct tenant visibility state

This layer must never produce an ungoverned capability.

### Selection rules
- prefer a published workflow if it exactly matches intent
- otherwise compose from approved actions if dynamic composition is allowed
- if no safe path exists, fail explicitly

---

## Layer 5 — Plan Compiler
Purpose:
- turn an allowed contract plus allowed capabilities into an executable plan

The plan is not a casual reasoning trace.
It is a governed execution artifact.

### What a plan contains conceptually
- selected actions
- sequence or graph
- branching rules
- wait states
- approvals
- connector calls
- expected artifacts
- output control checkpoints
- failure handling mode

### Why compile a plan
Because Opita Sync needs:
- determinism where possible
- explainability
- explicit checkpoints
- replayability of decisions
- separation between "what the user wants" and "what the runtime will do"

---

## Layer 6 — Durable Runtime
Purpose:
- execute the plan reliably over time
- survive failures
- pause and resume
- wait on humans
- wait on external systems
- preserve state transitions

For Opita Sync, the runtime must conceptually support:
- long-running workflows
- retries
- timers
- external callbacks
- manual approvals
- resumable execution
- event history

This is why a durable workflow model fits better than a fragile request-response loop.

---

## Layer 7 — Human Gate Controller
Purpose:
- stop execution when approval or human confirmation is required
- resume only through explicit allowed decisions

This layer must distinguish:
- approval to start
- approval to apply
- approval to disclose
- approval to delegate
- approval to promote an asset

Not all approvals are the same.

---

## Layer 8 — Output Controller
Purpose:
- evaluate user-visible or externally visible outputs before release

This layer checks:
- classification violations
- mixed-authority content
- disclosure policy
- outbound channel rules
- whether the final effect is only a draft or an actual apply/send

### Required outcomes
- release
- release redacted
- hold for approval
- block
- reroute to safer alternative

This layer is not optional in Opita Sync.
It is core to the product.

---

## Layer 9 — Audit and Explanation Recorder
Purpose:
- make the entire path reconstructable later

At minimum, the system must be able to answer:
- who asked
- under which tenant and environment
- which contract was used
- which policy version was in force
- which classification labels mattered
- which asset versions were selected
- whether dynamic composition happened
- who approved
- what ran
- what was blocked or redacted
- why the final outcome happened

---

## Recommended technology posture

This section is intentionally at the level of architectural posture, not a hard lock-in contract.

### Durable runtime posture
Use a durable workflow engine pattern, not a transient async job queue pattern.

Why:
- approvals introduce pauses
- enterprise actions often span minutes, hours, or days
- retries and resume semantics matter
- event history matters
- external callbacks matter

### Authorization posture
Use a proper authorization model with explicit principals, resources, actions, relationships, and policy.

Do not rely on scattered if-statements.

### Event posture
Normalize inbound and outbound automation events with a consistent event contract.
Do not let each connector invent its own runtime semantics.

### Capability posture
Actions must be treated as first-class governed capabilities with metadata.
They are not just convenience wrappers around SDK calls.

---

## The specific recommendation Codex should follow

When implementing Opita Sync, prefer an architecture equivalent to:

### Durable orchestration
A Temporal-like durable workflow model.

Reason:
Opita Sync needs long-running, resumable, eventful, approval-heavy execution.

### Relationship-rich permissions
A SpiceDB/Zanzibar-style relationship graph for person-to-person and person-to-resource authority.

Reason:
Delegation, admin hierarchy, and asset visibility/usage are relationship-heavy.

### Contextual policy engine
A Cedar-like policy layer for contextual authorization.

Reason:
The system must evaluate fine-grained policies over principals, resources, actions, and context.

### Event normalization
A CloudEvents-like event model plus AsyncAPI-style message contracts.

Reason:
Triggers come from many systems and must land in one predictable orchestration model.

Important:
These are the right **shapes** for the problem.
Equivalent choices are acceptable only if they preserve the same guarantees.

---

## Why these shapes fit Opita Sync

### Durable workflows fit because
- approvals pause execution
- humans intervene mid-flight
- external events resume runs
- retry and replay matter
- audit history matters

### Relationship-based permissions fit because
- admins delegate to subadmins
- people act on behalf of people
- asset visibility differs from asset usage
- system identities have owners
- rights often depend on graph relationships, not only on flat roles

### Policy engines fit because
- the same action may be allowed in one context and forbidden in another
- classification changes behavior
- environment matters
- jurisdiction matters
- area/function matters
- "why was this denied?" must be answerable

### Event normalization fits because
- Opita Sync handles internal and external triggers
- automation must not be connector-specific at the orchestration layer
- consistent event contracts reduce system ambiguity

---

## What the orchestrator should expose to the UI

The orchestrator should produce user-facing artifacts, not only backend state.

### In Operate, the user should be able to see:
- interpreted objective
- effective scope
- selected or restricted data domains
- selected or restricted connectors
- whether delegation applies
- whether approval applies
- whether the final effect is draft-only or apply/send-capable
- whether the run is blocked, pending, running, completed, redacted, or denied

### In Inbox, the user should be able to act on:
- approvals
- blocked runs needing intervention
- access escalation requests
- redaction alternatives where policy allows

### In Activity, the user should be able to inspect:
- run history
- plan summary
- policy and approval path
- status transitions
- artifacts and final outcome

---

## What Codex should avoid when implementing orchestration

- Avoid a single "agent loop" that plans and executes with no formal compilation boundary.
- Avoid direct tool invocation from chat without contract and policy validation.
- Avoid ephemeral task queues as the sole runtime model for important runs.
- Avoid storing governance semantics only in prompts.
- Avoid implicit approvals or hidden final-apply behavior.
- Avoid using raw connector SDK calls as the capability boundary.
- Avoid letting output release bypass the same governance rigor as execution.

---

## Mental model for the whole system

Think of Opita Sync as:

- a governed intent compiler
- plus a governed capability registry
- plus a durable runtime
- plus a disclosure control layer

The LLM is a component inside that machine.
It is not the machine itself.

---

## Final rule

If a future implementation idea makes orchestration feel "more magical" by making authority less explicit, less durable, less auditable, or less policy-bound, it is the wrong direction for Opita Sync.
