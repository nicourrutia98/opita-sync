# 02. Domain Model

## Domain intent

The domain model must make governance explicit and preserve explainability. It must not flatten distinct concepts for convenience.

## Core organizational entities

### Tenant
Represents an isolated customer boundary.

Key properties:
- tenant_id
- status
- default policy profile refs
- enabled environments
- ownership metadata

### Environment
Represents a real execution and publication boundary.

Canonical set:
- dev
- staging
- prod

Environment affects:
- publication state
- connector availability
- credentials
- runtime boundary
- policy applicability

### User
Represents a human actor within a tenant.

### Role
Represents baseline hierarchical RBAC position.
Examples:
- superadmin
- tenant_admin
- subadmin
- end_user
- approver

### Relationship
Represents authority relationships, including delegation and on-behalf-of control.

### SystemIdentity
Represents a machine principal.
Hard requirement:
- every system identity has a responsible human owner

## Governance entities

### PolicySet
Versioned set of governance rules.

### PolicyRule
Rule with subject/resource/action/context conditions and effect:
- deny
- allow
- allow_with_obligations
- require_approval
- require_redaction

### ClassificationScheme
Versioned enterprise classification model.

### ClassificationMark
Applied to:
- assets
- data scopes
- run artifacts
- outputs
- plans
- connector results

## Catalog entities

### ActionAsset
Governed capability that performs one bounded thing.

Properties include:
- identity
- lifecycle state
- publication state per environment
- connector metadata
- approval mode
- policy metadata
- classification metadata
- input/output contracts

### WorkflowAsset
Governed multi-step capability composed of approved actions.

### AssetPublication
Publishes an asset into a specific environment boundary.

Lifecycle states:
- draft
- review
- approved
- published
- retired

Version rule:
- compatible change -> new version
- breaking change -> new asset identity

## Intent and contract entities

### IntentSession
Holds raw user input or event input plus interpretation artifacts.

### ExecutionContract
Canonical pre-execution artifact.
Must model at least:
- objective
- scope
- allowed data
- allowed connectors
- delegation context
- approval expectations
- allowed final action
- desired output

### ContractConstraint
Constraint attached to the contract:
- user-imposed
- system-imposed
- policy-imposed
- classification-imposed

## Authorization entities

### EffectiveAuthority
Must separate at least:
- view asset
- use asset
- access data scope
- generate draft
- apply
- send
- approve
- delegate

### AdmissibilityDecision
Outcome of policy evaluation over the contract.
Possible outcomes:
- allow
- allow_with_restrictions
- require_approval
- require_redaction_path
- deny

## Execution entities

### ExecutionPlan
Compiled execution artifact from contract + governance + approved assets.
Contains:
- selected assets
- ordered/graph steps
- branching rules
- waits
- approval nodes
- output control checkpoints
- failure handling

### Run
Concrete execution instance bound to:
- contract revision
- plan snapshot
- policy snapshot
- classification snapshot
- initiating authority context

### RunStep
Represents each executable step in a run.

### ApprovalCase
Represents approval state and evidence.

### OutputArtifact
Represents candidate output or externally visible payload.

### ReleaseDecision
Represents final release result:
- release
- release_redacted
- hold_for_approval
- block

## Key separations that must remain explicit
- visibility != usage
- usage != data access
- draft generation != apply authority
- execution success != output release
- connector availability != connector authorization
- asset lifecycle state != tenant visibility state
