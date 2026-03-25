# 08. UI and Backend Alignment

## Purpose

The UI must make governance visible rather than hiding it behind convenience shortcuts.

## Top-level UI modules
- Operate
- Catalog
- Inbox
- Activity
- Governance
- Settings

## Operate
Aligned backend contexts:
- Intent & Contract
- Authorization & Admissibility
- Capability Selection
- Execution Compilation
- Durable Runtime
- Output Control

Must show:
- interpreted objective
- contract fields
- scope and constraints
- allowed/restricted data and connectors
- approval requirements
- plan preview summary
- run status
- release status

## Catalog
Aligned backend contexts:
- Catalog & Asset Lifecycle
- Publication
- Visibility policy

Must show:
- visible approved assets
- version and lifecycle status
- environment publication state
- approval mode
- policy/classification metadata summary

Rule:
Launching from Catalog opens Operate with a seeded contract.

## Inbox
Aligned backend contexts:
- Approval & Human Gates
- Inbox & Work Queue

Must show actionable items, not passive notifications.

## Activity
Aligned backend contexts:
- Audit, Activity & Evidence
- Durable Runtime history

Must emphasize:
- run timelines
- policy trail
- approval trail
- release trail

## Governance
Aligned backend contexts:
- Delegation & Authority
- Governance Policy
- Classification
- Catalog governance
- Publication control
- system identities

Must not be merged with Settings.

## Settings
Aligned backend contexts:
- Settings & Environment Plumbing
- Connector / credential configuration surfaces
- Provider configuration
- SSO / SCIM / invitations

Must not become the authority console.

## UI rules
- Governance and Settings remain separate
- Catalog does not bypass Operate
- approvals are visible as state transitions
- output block/redaction/hold are primary states, not edge cases
- users must understand why something was allowed, denied, held, or redacted
