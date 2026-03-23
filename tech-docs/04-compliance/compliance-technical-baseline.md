---
id: tech-compliance-baseline
title: Compliance Technical Baseline
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-1
related_docs:
  - ../../docs/06-compliance/data-and-retention-policy.md
  - ../../docs/02-reference/product-ownership-and-pilot-terms.md
---

# Compliance Technical Baseline

## Purpose

Translate approved data and retention rules into implementation-facing constraints.

## Constraints

- every relevant record is segregated by `tenant_id`
- operational memory is not an improvement dataset by default
- reusable chat history requires tenant opt-in
- reusable chat history excludes sensitive data
- retention policy is platform-defined and tenant-adjustable within approved limits

## Responsibility model

- tenant = primary owner of operational data and internal policy
- Opita Sync = platform operator for orchestration, traceability, retention, and support processing
- model provider = external third party selected by the tenant

## Required evidence

- action audit events
- model-call traces
- opt-in reference when reuse is enabled
- applied retention rule reference
