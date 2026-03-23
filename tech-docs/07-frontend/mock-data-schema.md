---
id: tech-mock-data-schema
title: Mock Data Schema
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./mock-data/mock-conversations.json
  - ./mock-data/mock-cases.json
  - ./mock-data/mock-users-and-roles.json
  - ./mock-data/mock-tenant-settings.json
---

# Mock Data Schema

## Purpose

Define realistic mock inputs for design, mockups, and state coverage.

## Required datasets

- `mock-conversations.json`
- `mock-cases.json`
- `mock-users-and-roles.json`
- `mock-tenant-settings.json`

## Coverage rules

- at least one dataset per role
- at least one blocked action
- at least one pending invitation
- at least one accessibility override example
- at least one offline or retry scenario
