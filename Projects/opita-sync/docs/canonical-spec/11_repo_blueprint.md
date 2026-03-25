# 11. Canonical Repo Blueprint

## Purpose

This document defines the canonical repository shape for Opita Sync implementation.
It follows the product semantics first and uses the starter pack only where it aligns.

## Repository principles

- governance-first, not chat-first
- contract-first, not tool-first
- explicit bounded contexts
- durable execution and output control as first-class modules
- Governance and Settings remain separate
- frontend starter assets are reusable inputs, not source of truth

## Canonical top-level layout

```text
opita-sync/
  docs/
    decisions/
    canonical-spec/
    product/
    governance/
  apps/
    web/
    ops-console/
    storybook/
  packages/
    domain/
    application/
    policy-engine/
    classification/
    contracts/
    catalog/
    connectors/
    identities/
    authority/
    orchestrator/
    runtime/
    approvals/
    output-control/
    audit/
    inbox/
    ui-core/
    ui-opita/
    provider-adapters/
    shared-kernel/
  services/
    api/
    worker-runtime/
    worker-connectors/
    worker-output-control/
  infrastructure/
    env/
    deployment/
    observability/
    scripts/
  tests/
    contract/
    integration/
    e2e/
    policy/
    runtime/
  starter-assets/
    imported/
    accepted/
    discarded/
```

## Top-level responsibilities

### `docs/`
Source of truth for:
- decision records
- canonical specs
- governance rules
- product constraints

### `apps/web/`
Primary product shell implementing:
- Operate
- Catalog
- Inbox
- Activity
- Governance
- Settings

### `apps/ops-console/`
Reserved for superadmin-heavy operational surfaces if separation becomes necessary.
Default assumption: keep one app shell first unless governance complexity forces split.

### `apps/storybook/`
Visual regression and governed UI primitives showcase.
This is where accepted starter-pack UI inputs should land after adaptation.

### `packages/domain/`
Pure domain types and invariants.
No framework/runtime IO.

### `packages/application/`
Use cases and application services orchestrating domain behavior.

### `packages/policy-engine/`
Policy model, evaluation contracts, explainability artifacts.

### `packages/classification/`
Classification model, handling rules, mixed-authority analysis inputs.

### `packages/contracts/`
Execution contract model, revision rules, normalization interfaces.

### `packages/catalog/`
Action/workflow assets, lifecycle, publication, semantic version rules.

### `packages/connectors/`
Connector registry, connector metadata, credential references, governed invocation contracts.

### `packages/identities/`
Tenants, users, memberships, system identities.

### `packages/authority/`
Delegation, relationship-aware authority, effective authority resolution.

### `packages/orchestrator/`
Intent interpretation, contract building, admissibility orchestration, capability selection, plan compilation boundaries.

### `packages/runtime/`
Run model, step model, pause/resume, retries, callbacks, workflow state machine.

### `packages/approvals/`
Approval cases, approval modes, transitions, assignment semantics.

### `packages/output-control/`
Release decisions, redaction flows, hold/block logic, disclosure control.

### `packages/audit/`
Audit events, evidence model, decision trace persistence contracts.

### `packages/inbox/`
Actionable work queue model and query contracts.

### `packages/ui-core/`
Framework-agnostic or low-coupling UI primitives.
Only accepted starter-pack primitives that align with Opita Sync should be adapted here.

### `packages/ui-opita/`
Opita-specific app shell, navigation, governed state blocks, domain-centric UI components.

### `packages/provider-adapters/`
Provider-neutral adapter interfaces plus OpenAI/Anthropic/Gemini adapters.
No provider may own governance semantics.

### `packages/shared-kernel/`
Truly shared low-level utilities and types only.
Must stay small.

### `services/api/`
Main backend API boundary.

### `services/worker-runtime/`
Durable execution worker boundary.

### `services/worker-connectors/`
Connector execution boundary, if separation is needed.

### `services/worker-output-control/`
Release and output-check worker boundary, if separation is needed.

## Required package dependency direction

Allowed general direction:

```text
apps -> application -> domain
apps -> ui-opita -> ui-core
application -> domain
application -> policy-engine / classification / contracts / catalog / authority / runtime / approvals / output-control / audit
orchestrator -> contracts / authority / policy-engine / classification / catalog / runtime / approvals / output-control / audit
runtime -> domain / approvals / audit
output-control -> classification / policy-engine / audit / domain
provider-adapters -> shared-kernel only (plus explicit contracts)
```

Forbidden direction examples:
- domain depending on apps
- governance packages depending on provider adapters
- Settings plumbing packages defining governance semantics
- UI package becoming source of authority truth

## Starter pack consumption policy

### Acceptable to reuse
- neutral UI primitives
- app shell layout fragments
- icon family where semantics align
- branding assets that fit Opita Sync IA
- storybook scaffolding

### Must be adapted before use
- navigation labels not aligned to Operate/Catalog/Inbox/Activity/Governance/Settings
- generic shells that blur governance semantics
- any visual element that hides policy, approval, or risk state

### Must be discarded if conflicting
- components implying free chat/tool usage
- anything merging Governance and Settings
- anything making approval or blocked states look secondary

## Initial implementation slices

### Slice A — Governance substrate
- identities
- authority
- policy-engine
- classification
- audit

### Slice B — Catalog and contracts
- catalog
- contracts
- publication

### Slice C — Orchestrator and compilation
- orchestrator
- runtime plan model
- approvals integration points

### Slice D — Durable execution and output control
- runtime
- approvals
- output-control
- inbox

### Slice E — Product UI
- ui-core
- ui-opita
- web app shell
- Activity/Governance/Settings surfaces

## Non-negotiable repo rules
- no package may bypass the execution contract boundary
- no direct connector call from chat-facing code
- no release to user without output-control decision
- no governance semantics defined only inside UI code
