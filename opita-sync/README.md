# Opita Sync

Frontend mobile-first de Opita Sync con Storybook, Playwright y backend `Node + Fastify + Prisma + PostgreSQL` dentro del mismo repo.

## Estado actual

- La UI ya no consume datos estaticos directo desde las vistas.
- La app usa `OpitaAppServices` como contrato unico de consumo.
- El runtime soporta `stub` y `remote`, con fallback controlado a stub.
- Las vistas principales exponen loading, empty, error y retry.
- La app ahora tiene login completo con `email + password`, sesion persistida y bootstrap autenticado por tenant/rol.
- El repo incluye backend multi-tenant con modelo de datos R1-R4 y seeds demo.

## Variables de entorno

Usa `.env.example` como base:

- `VITE_OPITA_DATA_SOURCE=stub|remote`
- `VITE_OPITA_API_BASE_URL=https://...`
- `VITE_OPITA_AUTH_STORAGE_KEY=opita-sync.session`
- `VITE_OPITA_ENABLE_STUB_FALLBACK=true|false`
- `VITE_OPITA_FAIL=dashboard,cases,detail,chat,tenant`
- `VITE_OPITA_FAIL_ONCE=cases`
- `VITE_OPITA_AUTH_FAIL=cases:unauthorized`
- `VITE_OPITA_AUTH_FAIL_ONCE=tenant:forbidden`
- `OPITA_SMOKE_API_BASE_URL=https://staging-api...`
- `OPITA_SMOKE_ADMIN_EMAIL=admin@tenant...`
- `OPITA_SMOKE_ADMIN_PASSWORD=...`
- `OPITA_SMOKE_TECNICO_EMAIL=tecnico@tenant...`
- `OPITA_SMOKE_TECNICO_PASSWORD=...`
- `OPITA_SMOKE_ALLOW_MUTATIONS=true|false`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=15m`
- `REFRESH_TOKEN_DAYS=7`
- `PORT=4000`

Las variables `FAIL` y `AUTH_FAIL` sirven para smoke y QA del adapter sin tocar codigo. `AUTH_STORAGE_KEY` define la persistencia del bearer token en navegador.

## Comandos principales

- `npm run orchestrator:serve`
- `npm run codex:pick`
- `npm run codex:exec:auto`
- `npm run codex:chat:auto`
- `npm run router:benchmark`
- `npm run router:report`
- `npm run router:calibrate`
- `npm run build:site`
- `npm run storybook`
- `npm run storybook:build`
- `npm run lint`
- `npm run typecheck`
- `npm run unit`
- `npm run integration`
- `npm run content`
- `npm run backend:dev`
- `npm run backend:build`
- `npm run backend:test`
- `npm run db:up`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:reset`
- `npm run contracts:smoke:remote`
- `npm run contracts:smoke:staging`
- `npm run e2e`
- `npm run visual`
- `npm run a11y`
- `npm run ci`

## Router de modelo para Codex

Este proyecto conserva comandos de routing heredados del workspace original, pero no son la pieza central del release de Opita Sync. Si el workspace padre los sigue usando, se mantienen disponibles para compatibilidad operativa.

- `npm run codex:pick`
- `npm run codex:exec:auto`
- `npm run codex:chat:auto`
- `npm run router:benchmark`
- `npm run router:report`
- `npm run router:calibrate`

Limitacion importante: este router no cambia el modelo del chat actual en caliente.

## Ejecucion local

1. Instala dependencias con `npm install`.
2. Configura `.env` desde `.env.example`.
3. Ejecuta `npm run storybook` para documentacion o `npm run build:site` para build de release.
4. Para backend local:
   - `npm run db:up`
   - `npm --prefix backend run prisma:generate`
   - `npm run db:migrate`
   - `npm run db:seed`
   - `npm run backend:dev`

## Estrategia de servicios

- `src/domain/` contiene tipos de dominio estables.
- `src/services/api/` contiene DTOs de integracion.
- `src/services/view-models.ts` contiene los modelos consumidos por la UI.
- `src/services/contracts.ts` define servicios de auth, operacion, gobernanza, compliance, reporting, drafting y usage export.
- `src/services/stub/` contiene fixtures y adapters de desarrollo.
- `src/services/remote/` contiene el adapter HTTP para backend real.
- `src/components/opita/auth-shell.tsx` cubre login, reset, sesion expirada y bootstrap fallido.
- `backend/` contiene API, Prisma schema/migraciones y seed de datos multi-tenant.

## Smoke remoto de contratos (R3/R4)

- Ejecuta `npm run contracts:smoke:remote` con variables `OPITA_SMOKE_*` configuradas.
- Si `OPITA_SMOKE_ALLOW_MUTATIONS=false`, el smoke valida solo rutas de lectura y operaciones seguras.
- Si `OPITA_SMOKE_ALLOW_MUTATIONS=true`, tambien valida endpoints mutables (`usage/export`, `governance/action`, `compliance/data-reuse-consent`).
