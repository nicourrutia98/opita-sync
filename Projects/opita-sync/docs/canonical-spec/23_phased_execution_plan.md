# 23. Phased Execution Plan

## Phase 1 ? Governance substrate
### Objective
Implement the minimum substrate that makes governance explicit before any executable AI flow exists.

### Packages in scope
- domain
- identities
- authority
- policy-engine
- classification
- audit
- shared-kernel

### Deliverables
- canonical TypeScript domain models
- authority artifacts and separated permission surfaces
- policy decision schemas and explainability artifacts
- classification schemes and handling rule schemas
- audit event model

### Exit criteria
- effective authority can be represented without flattening permissions
- policy decision artifact can express deny / allow / restrict / require approval / require redaction
- audit event model exists for decisions and transitions

## Phase 2 ? Catalog and contract foundation
### Objective
Make approved capabilities and execution intent explicit and governable.

### Packages in scope
- catalog
- contracts
- application

### Deliverables
- action/workflow asset schemas
- lifecycle and publication model
- execution contract schemas and revisions
- admissibility request envelope

### Exit criteria
- assets have lifecycle + publication + semantic immutability rules
- raw user intent can be normalized into contract revision artifacts
- no path exists from chat intent directly to execution

## Phase 3 ? Admissibility and compilation boundary
### Objective
Implement the decision boundary between allowed intent and compiled execution.

### Packages in scope
- orchestrator
- authority
- policy-engine
- classification
- catalog
- contracts
- application

### Deliverables
- admissibility evaluation flow
- capability selection rules using only approved/published assets
- execution plan schema
- plan compiler inputs/outputs

### Exit criteria
- admissibility completes before plan compilation
- denied and approval-required outcomes are explicit
- dynamic composition remains limited to approved assets

## Phase 4 ? Durable runtime and approvals
### Objective
Execute compiled plans with durable state and human gates.

### Packages in scope
- runtime
- approvals
- inbox
- audit
- services/worker-runtime

### Deliverables
- run and step state machines
- approval case state machine
- pause/resume/wait/retry model
- inbox item model for actionable work

### Exit criteria
- approvals pause and resume the same run identity
- runtime distinguishes retryable vs terminal failure
- inbox shows actionable approval/intervention items

## Phase 5 ? Output control and release decisions
### Objective
Control disclosure separately from execution success.

### Packages in scope
- output-control
- classification
- policy-engine
- audit
- services/worker-output-control

### Deliverables
- output artifact schema
- mixed-authority analysis artifact
- release decision artifact
- redaction / hold / block / release flow

### Exit criteria
- execution completion does not automatically disclose output
- mixed-authority blocks by default
- release decision is auditable and explicit

## Phase 6 ? API and product shell
### Objective
Expose governed behavior through a canonical product surface.

### Packages and apps in scope
- services/api
- apps/web
- ui-core
- ui-opita
- application

### Deliverables
- API boundaries for Operate / Catalog / Inbox / Activity / Governance / Settings
- canonical app shell
- governed UI states for deny / approval / blocked / redacted / released

### Exit criteria
- Governance and Settings remain separate
- Catalog launches into Operate instead of bypassing it
- blocked and approval states are first-class UI states

## Phase 7 ? Connector execution boundary
### Objective
Enable governed external actions without breaking central connector control.

### Packages and services in scope
- connectors
- services/worker-connectors
- runtime
- catalog

### Deliverables
- connector registry contracts
- runtime-approved connector invocation boundary
- environment and credential scope enforcement

### Exit criteria
- no freeform connector execution path exists
- connector calls happen only from compiled runtime steps

## Phase 8 ? Provider adapters
### Objective
Add configurable model providers under provider-neutral governance.

### Packages in scope
- provider-adapters
- orchestrator
- services/api

### Deliverables
- provider-neutral interfaces
- OpenAI / Anthropic / Gemini adapters
- provider selection config surfaces in Settings

### Exit criteria
- providers do not bypass governance substrate
- provider choice does not change contract, policy, runtime, or release semantics

## Phase 9 ? Hardening and enterprise readiness
### Objective
Complete enterprise-grade promotion, observability, and evidence quality.

### Scope
- infrastructure
- observability
- deployment
- tests
- audit
- Governance publication controls

### Deliverables
- promotion controls across dev/staging/prod
- evidence completeness checks
- policy/runtime/output-control integration tests
- e2e governed-flow tests

### Exit criteria
- reviewer can reconstruct why a run was allowed, paused, blocked, redacted, or released
- governance semantics remain stable under deployment and operational pressure
