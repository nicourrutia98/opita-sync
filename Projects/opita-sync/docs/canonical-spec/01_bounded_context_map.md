# 01. Bounded Context Map

## Core principle

Opita Sync is a governed execution platform. Its canonical flow is:

**intent -> contract -> policy validation -> execution compilation -> durable execution -> output control**

No bounded context may erase or bypass that flow.

## Canonical bounded contexts

### 1. Identity & Tenant
Owns:
- tenant
- environment membership
- user identity
- org membership
- system identities
- human ownership of automation

Does not own:
- final authorization decisions
- policy logic
- asset lifecycle

### 2. Delegation & Authority
Owns:
- delegation relationships
- on-behalf-of authority
- bounded authority scopes
- revocation/expiration
- separation of view/use/draft/apply/send/approve/delegate rights

Does not own:
- connector configuration
- asset publication
- policy rule authoring

### 3. Governance Policy
Owns:
- policy sets
- policy rules
- policy versioning
- precedence resolution
- deny/allow/restrict/escalate semantics
- explainability artifacts

Does not own:
- raw identity facts
- runtime step execution

### 4. Classification & Information Control
Owns:
- classification schemes
- tags
- handling rules
- mixed-authority detection inputs
- information handling constraints

Does not own:
- asset lifecycle
- connector connectivity

### 5. Catalog & Asset Lifecycle
Owns:
- action assets
- workflow assets
- lifecycle state
- publication state by environment
- semantic immutability rules
- version compatibility vs new identity rules

Does not own:
- execution of runs
- user-specific admissibility

### 6. Connector & Credential Governance
Owns:
- connector types
- connector instances
- credentials references
- environment availability
- revocation/rotation
- machine scope bindings

Does not own:
- tenant freeform connector creation
- output release decisions

### 7. Intent & Contract
Owns:
- intent interpretation artifacts
- contract draft/final/revisions
- objective/scope/constraints model
- contract normalization

Does not own:
- final authorization
- runtime execution

### 8. Authorization & Admissibility
Owns:
- effective authority evaluation
- contract admissibility result
- allow/restrict/require approval/deny outcomes
- obligations and restrictions

Does not own:
- asset authoring
- durable execution state

### 9. Capability Selection & Execution Compilation
Owns:
- selection of approved assets
- dynamic composition only from approved assets
- execution plan artifact
- plan checkpoints, waits, approval nodes, output checkpoints

Does not own:
- raw policy authoring
- release decision finality

### 10. Durable Runtime
Owns:
- run state
- step state
- retries
- waits
- callbacks
- pause/resume
- long-running execution durability

Does not own:
- initial admissibility decision logic
- connector catalog governance

### 11. Approval & Human Gates
Owns:
- approval cases
- approval assignment
- pre-execution / pre-application / double approval flow
- approval decision transitions

Does not own:
- policy authoring
- asset publication authoring

### 12. Output Control & Release
Owns:
- release decision
- redaction path
- hold for approval
- block decision
- outbound disclosure gating

Does not own:
- planning authority
- connector provisioning

### 13. Audit, Activity & Evidence
Owns:
- append-only audit events
- decision trace
- policy snapshot refs
- plan snapshot refs
- approval trace
- output release trace

Does not own:
- permission semantics
- asset governance semantics

### 14. Inbox & Work Queue
Owns:
- actionable approvals
- blocked runs needing action
- intervention tasks
- escalation work items

Does not own:
- passive notification logic as primary surface

### 15. Settings & Environment Plumbing
Owns:
- providers
- environment plumbing
- SSO/SCIM/invites plumbing
- connector admin surfaces as configuration plumbing
- credentials configuration references

Does not own:
- governance rules
- authority semantics
- publication decisions

## Critical boundaries

### Governance outranks Settings
Governance decides authority, policy, classification, publication, and approval semantics.
Settings configures technical plumbing only.

### Catalog does not bypass Operate
Catalog discovers approved assets.
Operate remains the governed execution workspace.

### Chat does not call tools directly
Chat produces intent and participates in contract shaping.
Execution always requires contract, policy validation, compilation, durable runtime, and output control.

### Connectors stay central
Connectors and credentials remain inside the central governance perimeter.
No tenant self-service connector perimeter is allowed.
