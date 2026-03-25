# PLANS.md

## Purpose

Use this file as the planning discipline for future work on Opita Sync.

This repository is not optimized for "write code immediately."
It is optimized for:
- understand the product
- preserve governance semantics
- then design and implement carefully

Before any major implementation, create or update an execution plan that follows this format.

---

## Required planning format

Every substantial plan must contain these sections.

### 1. Objective
What exact capability or subsystem is being designed or changed?

### 2. Why it exists in Opita Sync
Explain the business and governance reason, not only the technical reason.

### 3. Invariants touched
List which non-negotiable platform invariants are affected.

Examples:
- deny by default
- most restrictive rule wins
- output control
- connector governance
- immutable published semantics
- human-owned automation

### 4. Domain entities involved
List the core entities this plan changes or depends on.

Examples:
- tenant
- policy
- classification
- action
- workflow
- contract
- run
- approval
- connector
- system identity

### 5. User-facing behavior
Describe what the user, admin, or approver will experience.
Be concrete.

### 6. System behavior
Describe the backend state transitions and decision boundaries.

### 7. Risks if done incorrectly
Explain how a bad implementation could weaken governance, information control, or action control.

### 8. Proposed boundaries
Explain what belongs inside the subsystem and what must remain outside it.

### 9. Data and state implications
Describe important persisted state, versions, lifecycle, and audit consequences.

### 10. Open questions
List only real unresolved issues.
Do not invent ambiguity where the product docs already gave direction.

---

## Planning rules

### Rule 1
Do not write a plan that starts from framework choice.
Start from product semantics.

### Rule 2
Do not flatten separate concepts just because they feel similar.
Example:
- visibility is not usage
- draft is not apply
- connector availability is not connector authorization
- execution success is not output release

### Rule 3
Always explain how the plan preserves auditability.

### Rule 4
Always explain how the plan preserves policy explainability.

### Rule 5
If a plan weakens governance for convenience, call that out explicitly.

### Rule 6
For orchestration-related plans, keep the contract boundary explicit.

---

## Short plan template

Copy this template for future work:

```md
# <Plan name>

## Objective

## Why it exists in Opita Sync

## Invariants touched

## Domain entities involved

## User-facing behavior

## System behavior

## Risks if done incorrectly

## Proposed boundaries

## Data and state implications

## Open questions
```

---

## Definition of a good plan for this project

A good plan for Opita Sync makes it obvious:
- why the work matters
- where governance lives
- what state transitions happen
- what gets audited
- what gets blocked or escalated
- how the UI and backend stay semantically aligned

If the plan only explains tables, endpoints, queues, or components, it is incomplete.
