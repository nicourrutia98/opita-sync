# AGENTS.md

## Purpose

This repository describes **Opita Sync**, a multitenant enterprise platform for governed LLM chat and governed agentic actions.

Before proposing code, architecture, APIs, schemas, or UI, read these files first:

- `opita-sync-context.md`
- `ORCHESTRATOR.md`

This repository is intentionally **context-first**.
Do not jump straight into coding assumptions.

---

## What Opita Sync is

Opita Sync is **not** a generic chatbot and **not** an unconstrained agent framework.

It is a governed execution platform where:
- users express intent
- the platform constructs a contract
- permissions, policy, classification, and approvals constrain what is allowed
- only approved actions/workflows may execute
- outputs are controlled before release

---

## Repository instruction priority

When reasoning about this project, use this precedence:

1. Latest explicit decision record, if one exists
2. `opita-sync-context.md`
3. `ORCHESTRATOR.md`
4. Other repository docs
5. Your own defaults

If your defaults conflict with the project docs, the docs win.

---

## Non-negotiable invariants

Treat the following as hard requirements unless a later explicit decision record changes them:

- deny by default
- most restrictive rule wins
- user controls intent, not arbitrary capability
- connectors are centrally governed
- output control is a first-class governance surface
- mixed-authority content is blocked by default
- all automation has a human owner
- published assets are immutable in meaning
- breaking changes create new asset identities
- governance outranks convenience

---

## Product model you must preserve

The core flow is:

**intent -> contract -> policy validation -> execution compilation -> durable execution -> output control**

Do not collapse these stages into one opaque agent loop.

---

## UI/UX model you must preserve

The product's primary IA is:

- Operate
- Catalog
- Inbox
- Activity
- Governance
- Settings

Keep these meanings stable:

- **Operate** = governed execution workspace
- **Catalog** = approved asset discovery
- **Inbox** = actionable pending work, not passive notifications
- **Activity** = operational history and audit trail
- **Governance** = permissions, policy, classification, publication control
- **Settings** = environment and integration plumbing

Do not merge Governance and Settings.
Do not make Catalog bypass Operate.
Do not make users edit raw execution steps by default.

---

## Orchestration guidance

When designing the backend, preserve these logical layers:

- intent interpreter
- contract builder
- authorization/policy evaluator
- capability selector
- plan compiler
- durable runtime
- human gate controller
- output controller
- audit recorder

Equivalent technical implementations are fine only if they preserve the same semantics.

---

## Permissions guidance

Do not simplify the authorization model to only flat RBAC.

Preserve the intended blend of:
- hierarchical RBAC
- ABAC
- relationship-aware delegation and authority
- centralized policy
- approval constraints

Also keep separate decisions for:
- visibility
- usage
- data access
- draft generation
- apply/send authority

These are not the same permission.

---

## Catalog guidance

Actions and workflows are governed assets.

They have:
- lifecycle state
- environment publication status
- connector metadata
- policy metadata
- classification constraints
- approval mode
- version semantics

Do not model them as anonymous prompt templates or bare tool wrappers.

---

## Output-control guidance

Output governance is a primary feature.

Never assume that because data entered the model context it may be released to the user.

The system must support these release outcomes:
- release
- release redacted
- hold for approval
- block

Blocking and redaction are core product paths, not error paths.

---

## Automation guidance

Automation is allowed, but only under governance.

Manual runs and automatic runs must both preserve:
- contract semantics
- policy evaluation
- approval semantics
- audit trail
- human accountability

A system identity must always have a responsible human owner.

---

## What to do before implementing

Before coding any major subsystem, produce a brief written understanding of:
- what the subsystem is for
- which invariant(s) it touches
- which upstream and downstream modules it affects
- which user-facing consequence matters if it is wrong

If the subsystem changes governance semantics, pause and surface the tension explicitly.

---

## What to avoid

Avoid these patterns unless the repo later explicitly requests them:

- free-form agent loops with direct tool access
- hidden prompt-only policy enforcement
- tenant-self-service connectors
- one-boolean permission checks
- silent fallback behavior
- mutable published asset semantics
- UI that hides policy, approval, or risk state
- mixing operational history with vanity analytics
- treating approvals as notifications rather than state transitions

---

## How to respond when uncertain

If requirements appear underspecified, do not fill the gap with convenience-oriented defaults.

Instead:
- choose the more governable default
- choose the more auditable default
- choose the more restrictive default
- preserve future extensibility without weakening current control

---

## Success criteria

A strong implementation direction for Opita Sync should make a reviewer say:

- "I can see where governance lives."
- "I can explain why this run was allowed or denied."
- "I can tell the difference between view, use, draft, and apply."
- "I can see how approvals pause and resume work."
- "I can see how outputs are controlled."
- "I can see how tenant, environment, and publication state constrain execution."

If those are not obvious, the design is probably drifting away from the product.
