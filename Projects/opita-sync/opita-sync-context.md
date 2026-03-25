# Opita Sync — Product Context for Codex

## Purpose of this document

This file exists so a coding agent can understand **what Opita Sync is**, **what it must optimize for**, **what must never be violated**, and **why the system is designed this way**.

This is **not** a ready-to-dev task list.
This is a **context and intent document**.
Codex should read this file before proposing architecture, code, schemas, APIs, or UI.

If any future implementation detail conflicts with this document, this document wins unless a newer decision record explicitly overrides it.

---

## One-sentence definition

**Opita Sync is a multitenant enterprise platform for governed LLM chat and governed agentic actions, where users express intent, and the platform decides whether and how execution is allowed based on permissions, policies, classification, approvals, delegation, and environment boundaries.**

---

## What problem Opita Sync solves

Most "AI chat with tools" products are weak in governance.
They let the model decide too much, expose too much, or execute too freely.

Opita Sync exists to solve the harder enterprise problem:

- allow employees to use AI and agentic actions
- keep strict control over information access and information release
- keep strict control over what actions the AI may execute
- preserve auditability, revocability, approvals, and policy enforcement
- support multitenant enterprise operation from day one

Opita Sync is not primarily a creativity product.
It is primarily a **governed execution product**.

---

## Product thesis

The winning UX is **not**:
- "free chat plus random tools"
- "let the agent improvise"
- "let the user pick any connector"
- "let the AI directly act if it seems useful"

The winning UX is:

**intent -> contract -> policy validation -> execution compilation -> durable execution -> controlled output**

That means:

- the chat captures user intent
- the system turns intent into a structured contract
- the contract is checked against permissions, policy, classification, connector availability, approvals, and delegation
- only then does the system compile an executable plan
- execution is durable and auditable
- outputs are filtered, blocked, redacted, or escalated according to policy

This is the core product truth.

---

## Primary design objective

Opita Sync must optimize for the following, in this exact order:

### 1. Governance
The platform must maximize control over:
- who can do what
- over which data
- through which systems
- with which approvals
- with which delegation
- with which possible outputs
- in which environment

### 2. Information control
The platform must minimize accidental or unauthorized disclosure of data.

### 3. Action control
The platform must minimize accidental or unauthorized external effects.

### 4. Auditability
Every important decision must be explainable after the fact.

### 5. Operator clarity
Users and admins must understand why something was allowed, blocked, redacted, or escalated.

### 6. Usability
The app should still feel straightforward and efficient despite strict governance.

Important:
Usability matters, but it does **not** outrank governance.

---

## Non-goals

Opita Sync is **not** trying to be:
- an unconstrained autonomous agent platform
- a consumer chatbot
- a no-code builder for tenant-created automations
- a free-form workflow toy
- a tool that lets end users bypass policy through prompt cleverness

---

## Hard product invariants

These are non-negotiable.

### Intent is user-editable; capabilities are system-controlled
The user may express intent and adjust allowed constraints.
The user may not freely choose arbitrary capabilities.

### Deny by default
If the system cannot prove a request is allowed, it must deny it.

### Most restrictive rule wins
If multiple policies apply, the most restrictive effective outcome wins.

### No open agency
The LLM may not invent new capabilities outside the approved catalog and policy perimeter.

### Controlled connectors only
Users do not self-wire arbitrary external systems.
Connectors, credentials, and integrations are governed centrally.

### Output control is as important as input control
Even if retrieval was allowed, final output must still be policy-checked.

### Mixed-authority outputs must be blocked by default
If allowed and disallowed content mix together, the default is block, not partial leak.

### All automation has a human owner
Even if execution runs under a system identity, a human remains accountable.

### Published assets are immutable
Breaking changes create a new asset, not a silent mutation.

### Every important state transition must be auditable
This includes policy version, connector set, approval path, delegation state, and classification state.

---

## The exact operating model

### Entry points
Opita Sync has exactly two primary entry points for normal users:

- **Operate**: the governed execution workspace
- **Catalog**: the place to discover already-approved actions and workflows

Other areas exist, but these are the core user entry points.

### What the user actually does
The user does **not** primarily edit raw steps.

The user provides and optionally adjusts a **contract**:
- objective
- scope
- allowed data
- allowed connectors
- delegation context
- approval expectations
- allowed final action
- expected output

The system uses that contract to derive an execution plan.

### Why this is better
This is better than step-editing because enterprise users usually care about:
- what they want
- what data may be used
- who must approve
- whether something may be sent/applied
- what result should come out

They usually do **not** care to micromanage internal agent steps.
The contract-first model preserves governance while keeping the UX simpler.

---

## Core domain entities

These concepts must remain explicit in the architecture.

### Tenant
An isolated customer space.

### Environment
At minimum:
- dev
- staging
- prod

Environment boundaries are real, not cosmetic.

### User
A person operating within a tenant.

### Role
Hierarchical RBAC role assigned within a tenant.

### Relationship
Delegation or authority relation between people or identities.

### Policy
A centrally managed rule set that governs access and execution.

### Classification
Information sensitivity model plus handling rules.

### Action
A reusable governed capability that does one bounded thing.

### Workflow
A governed multi-step execution composed from approved actions.

### Contract
The user-facing intent-and-constraints object that precedes execution.

### Plan
The compiled execution structure derived from the contract.

### Run
A concrete execution instance.

### Approval
A human decision gate on a run or a high-risk step.

### Connector
An approved integration boundary.

### Credential
The governed secret or auth configuration behind a connector.

### System identity
A machine identity used for automated execution.

### Publication
The state by which an asset becomes available in a specific environment.

---

## Actors and authority model

### Superadmin
The only authority that may:
- create, edit, publish, retire actions
- create, edit, publish, retire workflows
- define and version policies
- define classification models
- enable connectors
- configure credentials
- promote assets between environments
- decide platform-wide governance behavior

### Tenant admin
May:
- assign visibility of already-published assets
- assign permission to use already-published assets
- manage admin and subadmin hierarchy inside the tenant
- manage allowed delegation relationships inside allowed policy bounds
- participate in approvals where policy allows

### Subadmin
May operate a subset of tenant-admin capabilities, delegated by admin.

### End user
May:
- use chat
- use visible catalog assets
- edit the contract within allowed bounds
- request execution
- review allowed results
- request redacted alternatives or approvals when blocked

### System identity
May execute only within explicitly assigned machine scope and always with a human owner.

---

## Permissions model

The permissions model is intentionally hybrid and enterprise-grade.

### Base model
- hierarchical RBAC for baseline role assignment
- ABAC for context-sensitive control
- ReBAC for delegation and person-to-person authority
- centralized policy engine for hard authorization
- approvals and separation-of-duties constraints for sensitive effects

### Why this combination was chosen
RBAC alone is too coarse.
ABAC alone becomes hard to reason about in UI.
ReBAC is necessary for delegation and identity relationships.
Centralized policy is necessary to keep governance consistent.
Approval constraints are necessary because some operations should not be auto-executable even if nominally "allowed."

### Platform truth
Permission to see an action is not the same as permission to run it.
Permission to run it is not the same as permission to use any data with it.
Permission to generate a draft is not the same as permission to send or apply it.

Those must remain separate decisions in the product and in the system model.

---

## Information classification model

Opita Sync uses an enterprise classification model from day one.

Each data object, output, document, run artifact, or action context may carry:

- a classification level
- regulatory or business tags
- handling rules

### Example mental model
Levels may resemble:
- internal
- confidential
- restricted
- high-impact

Tags may resemble:
- pii
- hr
- legal
- finance
- customer
- regulated
- export-controlled

Handling rules may specify:
- who may view
- who may summarize
- who may export
- who may send externally
- whether redaction is allowed
- whether a higher approval threshold applies

### Important product rule
Classification affects:
- retrieval
- reasoning context
- action composition
- plan compilation
- approvals
- output generation
- export and send operations
- audit and retention behavior

It is not just a document label.

---

## Output control model

This is critical.

### Default behavior
If a result contains or mixes content outside the user's effective permission and policy scope:
- block the output
- explain the reason at a policy-safe level
- offer one or more of:
  - request approval
  - generate a redacted version
  - reduce scope
  - retry under narrower allowed constraints

### What must not happen
The model must never "helpfully" leak the allowed part and only omit the forbidden part without governance.
Redaction must be explicit, logged, and policy-aware.

### Why
The last mile of risk is output, not only retrieval.
The product is designed around controlled disclosure.

---

## Connectors and integrations

Connectors are centrally governed.

### Only superadmin may
- enable a connector type
- configure a connector instance
- add or rotate credentials
- disable or revoke a connector
- decide environment availability

### Tenants may not
- create arbitrary connectors
- bring their own ungoverned credentials
- bypass the approved integration perimeter

### Why
Connector sprawl destroys governance.
The connector perimeter is part of the security and policy model, not a convenience setting.

---

## Execution model

The system supports both:
- action execution
- workflow execution

It also supports both:
- manual execution
- automatic trigger-based execution

### Manual execution
Started from Operate or Catalog.

### Automatic execution
Started by internal or external events.

### Important restriction
Dynamic workflows may only compose:
- approved actions
- approved connectors
- allowed data scopes
- effective permissions
- active policy versions

The orchestrator may assemble; it may not invent.

---

## Approvals model

Every action or workflow may be configured for one of these modes:
- auto
- pre-execution
- pre-application
- double approval

### Meaning
- auto: may run and apply without a human gate if policy allows
- pre-execution: needs approval before execution starts
- pre-application: may prepare or analyze, but final external effect waits for approval
- double approval: one gate before work begins and one before final application

### Why this matters
Enterprise risk is not binary.
Some actions are safe to analyze but unsafe to apply.
The platform must model that explicitly.

---

## Delegation model

Delegation exists because real companies operate through human hierarchies.

Supported forms:
- temporary delegation with expiration
- permanent delegation
- both revocable
- both bounded by scope

### Scope may include
- allowed actions
- allowed business areas
- allowed systems
- allowed data domains
- approval rights
- time window

Delegation is not a vague note.
It is a formal permission-affecting relationship.

---

## Access and identity model

Supported from day one:
- enterprise SSO
- SCIM
- manual invitation

### Governance rule
SSO is the preferred path.
Manual invitation exists, but remains controlled, revocable, expirable, and auditable.

### Why
Enterprise onboarding must be practical without weakening identity governance.

---

## Environment model

At minimum:
- dev
- staging
- prod

Each environment has separated:
- publication state
- connectors
- credentials
- policies as applicable
- runtime execution boundary

### Hard rule
Nothing publishes straight to prod without formal promotion.

---

## Asset lifecycle model

Actions and workflows have a formal lifecycle.

States:
- draft
- review
- approved
- published
- retired

### Version rule
- compatible change -> new version of same asset
- breaking change -> new asset identity

### Why
Silent semantic mutation breaks governance and auditability.

---

## LLM provider strategy

The product must support multiple providers through API configuration.

At minimum:
- OpenAI
- Anthropic
- Gemini

### Product rule
Provider choice is configurable.
The platform may designate one orchestrator model as current primary.
Future architecture may route different subtasks to different models.
But governance must remain provider-agnostic.

---

## User experience model

The most user-friendly structure for this specific product is a **single app shell** with persistent navigation and object-centric detail views.

### Primary navigation areas
These are the top-level areas of the product:

- **Operate**
- **Catalog**
- **Inbox**
- **Activity**
- **Governance**
- **Settings**

No other top-level sections should exist unless a later design record explicitly adds one.

### Why this IA
This structure keeps the app understandable:
- users know where to go to do work
- users know where to discover approved capabilities
- users know where pending decisions live
- users know where history lives
- admins know where governance lives
- technical and tenant settings stay separate from governance

---

## Exact UI map

### 1. Operate
This is the execution workspace and the real home screen.

It contains:
- the conversation surface
- the contract editor
- plan preview
- execution stream
- result display
- policy/risk warnings
- block and redaction options when relevant

This is where user intent becomes governed execution.

### 2. Catalog
This is the discovery area for approved actions and workflows.

It contains:
- search
- filters
- list of visible assets
- asset detail
- version and lifecycle information
- launch into Operate with prefilled contract

Catalog does not directly bypass Operate.
Launching from Catalog opens the governed execution workspace.

### 3. Inbox
This is the action-required queue.

It contains:
- approvals waiting on the current user
- blocked runs needing intervention
- access requests
- delegation decisions
- publication reviews where relevant

Inbox is not a passive notification center.
It is a work queue.

### 4. Activity
This is the operational history space.

It contains:
- user runs
- tenant runs as allowed
- automation runs
- event history
- run timelines
- policy and approval trail
- blocked output incidents

### 5. Governance
Admin and superadmin area for actual governance controls.

It contains:
- roles and person-level access
- delegation
- policies
- classification models
- access matrices
- approvals by risk mode
- publication and promotion controls
- system identities

### 6. Settings
Environment and platform plumbing, kept separate from Governance.

It contains:
- tenant settings
- environments
- LLM providers
- API keys
- current orchestrator setting
- connectors
- credentials
- SSO / SCIM / invitations
- configuration audit trail

---

## How the screens connect

This must remain consistent.

### Operate <-> Catalog
Selecting an asset in Catalog opens Operate with a prefilled contract.
Catalog is for discovery; Operate is for execution.

### Operate <-> Inbox
If a run pauses for approval or intervention, the actionable item appears in Inbox.
Opening it should preserve the same run identity and context.

### Operate <-> Activity
Every run produces a durable history entry in Activity.

### Governance <-> Catalog
Governance affects what becomes visible and usable in Catalog, but Catalog never becomes the governance console.

### Settings <-> Governance
Settings handles environment plumbing and integration configuration.
Governance handles decision rules and authority logic.
They must not collapse into one mixed module.

---

## Required UX behavior

### The user should always understand:
- what the system thinks they are asking for
- what data is allowed
- what systems are allowed
- whether approval is needed
- whether final apply/send is allowed
- why something is blocked or redacted
- what they can do next

### The platform should never rely on:
- prompt wording alone for authorization
- hidden agentic steps as the source of truth
- undocumented defaults
- silent fallback behavior that changes governance semantics

---

## Orchestrator design principle

The orchestrator must be **contract-first and policy-compiled**.

That means:
- the LLM may help interpret intent
- the LLM may help propose a plan
- the LLM may help choose from approved actions
- but the execution system must only run what is validated against formal policy and formal capability metadata

The orchestrator is not "the model deciding."
The orchestrator is a governed compiler and runtime.

---

## What Codex should infer from this document

If you are Codex or another coding agent, assume the following:

- This product values governance more than convenience.
- Do not simplify away policy, classification, approvals, or output control.
- Do not collapse all permissions into one boolean.
- Do not make connectors tenant-self-service.
- Do not let the chat directly call arbitrary tools.
- Do not model actions and workflows as the same thing without lifecycle semantics.
- Do not treat blocking and redaction as edge cases; they are core flows.
- Do not treat Activity as a generic analytics dashboard; it is an operational history and audit surface.
- Do not mix Governance and Settings.
- Do not assume users should edit internal execution steps by default.
- Do not allow breaking asset changes to mutate published semantics.

---

## Final summary

Opita Sync is a governed execution system disguised as a chat product.

Its essence is:
- user intent in
- governed contract
- validated execution
- durable runtime
- controlled output
- complete audit trail

If future implementation ideas make the product feel easier by weakening governance, they are probably wrong for Opita Sync.
