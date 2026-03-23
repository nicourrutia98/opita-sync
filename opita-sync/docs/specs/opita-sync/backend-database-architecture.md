# Opita Sync Backend and Database Architecture

## Stack

- Runtime: Node.js + Fastify (`backend/src/app.ts`)
- ORM/migrations: Prisma (`backend/prisma/schema.prisma`, `backend/prisma/migrations`)
- Database: PostgreSQL
- Auth: JWT access token + persisted refresh tokens

## Multi-tenant data model

Core entities:
- `tenants`, `users`, `roles`, `user_role_assignments`, `sessions`, `refresh_tokens`

Operational entities:
- `cases`, `case_status_history`, `case_assignments`
- `conversations`, `conversation_messages`
- `operational_log_entries`, `operational_evidence`

Governance/configuration:
- `capabilities`, `tenant_capability_states`
- `tools`, `tool_capability_links`, `tool_policy_overrides`
- `tenant_parameters`, `tenant_parameter_values`

Value and consumption:
- `drafts`, `draft_approvals`
- `value_metric_events`, `value_metric_snapshots`
- `usage_events`, `billing_exports`

Compliance and platform:
- `audit_events`
- `retention_policies`, `data_reuse_consents`
- `governance_actions`, `deployments`, `rollback_events`
- `navigation_manifests`

## Endpoint coverage (R1-R4)

- Auth: `auth/login`, `auth/session`, `auth/password-reset/request`, `auth/password-reset/confirm`
- R1-R2: `dashboard`, `cases`, `cases/:code`, `chat/conversation`, `tenant-config`, `tenant-config/parameter`, `operational-log`, `capabilities`, `capabilities/state`, `tool-governance`
- R3: `drafts/generate`, `reporting/value`, `usage/attribution`, `usage/export`
- R4: `governance/state`, `governance/action`, `compliance/retention-policy`, `compliance/data-reuse-consent`, `navigation/manifest`

## Operational scripts

Root scripts:
- `backend:dev`, `backend:build`, `backend:test`
- `db:up`, `db:migrate`, `db:seed`, `db:reset`
- `contracts:smoke:staging`

Backend scripts:
- `prisma:generate`, `prisma:migrate`, `prisma:deploy`, `prisma:seed`, `prisma:reset`

## Seeds and demo credentials

The seed creates:
- 2 tenants (`acme-industrial`, `bio-petro`)
- 4 roles
- 4 demo users in `acme-industrial`
- capabilities, tools, parameters, cases, conversations, logs, value snapshots, usage, retention, consent, navigation manifests

Demo password for seeded users:
- `Demo1234!`
