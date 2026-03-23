---
id: tech-positive-action-model
title: Positive Action Model
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: phase-3
related_docs:
  - ../../docs/02-reference/plans-and-billing.md
  - ../../docs/02-reference/value-framework.md
  - ./tool-registry-spec.md
---

# Positive Action Model

## Purpose

Translate the approved business definition of `accion positiva` into a technical contract.

## Definition

A `positive_action` is a successful governed tool execution with no error and with sufficient recorded evidence.

## Eligible conditions

- known tenant
- known actor
- known capability
- known tool and version
- execution result `success`
- required audit record exists

## Non-eligible conditions

- `failed`
- `blocked`
- `requires_confirmation`
- suggested but not executed

## Relationship to business model

- `positive_action` is a future analysis and monetization unit
- it is not the current billing baseline
