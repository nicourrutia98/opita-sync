---
id: tech-system-architecture
title: System Architecture
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: phase-1
related_docs:
  - ../../docs/00-overview/product-blueprint.md
  - ../../docs/01-explanation/foundations.md
  - ../../docs/02-reference/orchestrator-operating-model.md
  - ../../docs/02-reference/standard-pilot-spec.md
  - ../../docs/02-reference/context-and-memory-management.md
---

# System Architecture

## Purpose

Define the minimum phase-1 technical baseline for Opita Sync.

## Source docs

- `docs/00-overview/product-blueprint.md`
- `docs/01-explanation/foundations.md`
- `docs/02-reference/standard-pilot-spec.md`
- `docs/02-reference/context-and-memory-management.md`

## Components

- `client_app`: React Native client for web, iOS, Android
- `identity_access`: resolves `tenant_id`, `user_id`, `role`, permissions
- `orchestrator`: resolves request -> intent -> capability -> tool path
- `context_builder`: assembles context for each model call
- `capability_runtime`: executes operational capability logic and delegates technical actions to tools
- `tool_registry`: stores governed tool contracts, versions, and execution metadata
- `action_policy_engine`: decides `suggest`, `confirm_then_execute`, or `auto_execute`
- `tenant_configuration`: stores tenant-configurable rules and templates
- `audit_service`: stores business audit events
- `llm_trace_service`: stores model-call traces
- `llm_provider_adapter`: calls client-provided model provider

## Invariants

- no cross-tenant state mixing
- provider memory is not trusted system state
- action-level auditability is mandatory
- tenant configuration precedes product forks
- every sensitive or mutating capability must pass through permissions and audit
- every tool must execute under an action policy
- every mutating tool must expose risk classification and certification posture

## Core flow

1. receive authenticated request
2. resolve tenant and role
3. interpret intent
4. select capability
5. resolve candidate tool path
6. evaluate action policy
7. build context
8. call provider if needed
9. suggest, confirm, or execute
10. persist audit and trace records

## Open questions

- deployment boundary between services in AWS
- final interface between `orchestrator`, `tool_registry`, and `capability_runtime`
