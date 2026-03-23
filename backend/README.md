# Backend Baseline

This backend implements the first executable platform slice for Opita Sync.

## Scope

- NestJS + TypeScript
- PostgreSQL via Prisma
- Firebase Auth exchange into internal JWT sessions
- multitenant membership and role resolution
- tenant settings
- conversations and heuristic summaries
- base cases
- audit events
- llm traces
- context builder preview
- tool registry
- action policy evaluation
- tool execution attempts
- positive actions
- confirmation requests
- governed orchestrator runtimes for `status_query` and `request_create`

## Local setup

1. Start PostgreSQL:

```powershell
npm run db:up
```

2. Create `.env` from `.env.example`.
   The local Docker compose maps PostgreSQL to `localhost:54329`.

3. Apply migrations:

```powershell
npm run prisma:migrate:dev
```

4. Start the API:

```powershell
npm run start:dev
```

## Verification

Unit tests:

```powershell
npm test -- --runInBand
```

Jest e2e smoke:

```powershell
npm run test:e2e:jest -- --runInBand
```

Full integration flow against PostgreSQL:

```powershell
npm run test:e2e
```

The full integration flow expects:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- bootstrap env vars
- either real Firebase credentials or `FIREBASE_MOCK_USERS_JSON`

## Runtime slice

The current orchestrator runtime implements:

- `status_query` as the first governed capability
- `case_status_reader` as the first production tool
- `request_create` as the first mutating governed capability
- `case_request_writer` as the first mutating production tool
- policy evaluation for `suggest | confirm_then_execute | auto_execute | blocked`
- confirmation persistence for mutating execution
- execution evidence in `tool_execution_attempts`
- successful governed executions recorded as `positive_actions`

Primary runtime endpoints:

- `POST /api/orchestrator/execute`
- `POST /api/orchestrator/confirm/:id`
- `GET /api/tools`
- `POST /api/tools`
- `POST /api/tools/:id/review`
- `POST /api/tools/:id/certify`
- `POST /api/tools/:id/promote`
- `POST /api/tools/:id/deprecate`
- `GET /api/tool-executions`
- `GET /api/positive-actions`
- `GET /api/confirmation-requests`

UI and accessibility endpoints:

- `GET /api/auth/me/ui-profile`
- `PATCH /api/auth/me/ui-profile`
- `GET /api/tenants/current/ui-baseline`
- `PATCH /api/tenants/current/ui-baseline`
