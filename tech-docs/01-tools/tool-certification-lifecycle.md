---
id: tech-tool-certification-lifecycle
title: Tool Certification Lifecycle
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: phase-3
related_docs:
  - ./tool-registry-spec.md
  - ../../docs/02-reference/capability-governance.md
---

# Tool Certification Lifecycle

## Purpose

Define the promotion lifecycle for tools before production use.

## States

- `draft`
- `reviewed`
- `certified`
- `production`
- `deprecated`

## Minimum gates

- `draft` -> `reviewed`: contract, capability linkage, actor, permission, tenant scope
- `reviewed` -> `certified`: AI review, human certification, risk assigned, rollback defined, execution mode approved
- `certified` -> `production`: environment promotion approved, release record exists, monitoring posture defined

## Rules

- no mutating tool reaches `production` without human certification
- deprecated tools remain traceable but not selectable for new production execution
