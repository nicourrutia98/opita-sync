# 03. Canonical Execution Contract

## Purpose

The execution contract is the canonical boundary between user intent and governed execution.
No run may start without an admissible contract.

## Contract identity

Fields:
- contract_id
- revision
- tenant_id
- environment
- initiator_user_id
- authority_context_id
- source_type (`chat`, `catalog_launch`, `automation_event`)
- created_at
- updated_at
- status

## Contract core sections

### 1. Objective
- primary objective
- requested business outcome
- success criteria
- urgency
- domain context

### 2. Scope
- in-scope entities
- out-of-scope entities
- allowed business area
- allowed time window
- allowed data domains
- excluded data domains
- allowed external effect class

### 3. Capability intent
- requested action asset ref if any
- requested workflow asset ref if any
- candidate action family
- candidate workflow family
- dynamic composition requested? default false

### 4. Governance envelope
- classification ceiling
- allowed connector subset
- allowed credential scopes
- delegation context
- approval expectation
- draft/apply/send bounds
- output sensitivity expectation
- required human checkpoints if any

### 5. Output expectation
- desired output form
- disclosure audience
- export/send intent if any
- draft-only or final-effect intent

### 6. Constraints
- user constraints
- system defaults
- policy constraints
- classification constraints

## Contract lifecycle
- draft
- normalized
- restricted
- approval_required
- admissible
- denied
- compiled
- executed
- release_resolved

## Contract rules
- contract is versioned by revision
- admissibility is evaluated against a specific contract revision
- approvals attach to a specific contract revision and plan snapshot
- contract mutation after admissibility requires re-evaluation if governance-relevant fields changed

## Non-negotiable semantics
- raw prompt is not executable truth
- contract does not grant arbitrary capabilities
- contract captures intent and constraints; capability selection remains governed
- contract may be user-editable only within allowed bounds
