# Opita Sync Backend

Backend `Node + Fastify + Prisma + PostgreSQL` para los contratos R1-R4 de Opita Sync.

## Requisitos

- Node.js 20+
- PostgreSQL 16+

## Variables

Usa `backend/.env.example` como base:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_DAYS`
- `PORT`

## Flujo local

1. Instalar dependencias:
   - `npm --prefix backend install`
2. Generar cliente Prisma:
   - `npm --prefix backend run prisma:generate`
3. Levantar Postgres:
   - `docker compose up -d postgres`
4. Aplicar migraciones:
   - `npm --prefix backend run prisma:deploy`
5. Seed:
   - `npm --prefix backend run prisma:seed`
6. Correr backend:
   - `npm --prefix backend run dev`

## Provisionar un admin real sin stub

Si quieres entrar al frontend remoto con un tenant real local y una cuenta `admin` propia, puedes provisionarla sin crear roles nuevos:

1. Levanta DB y aplica migraciones:
   - `docker compose up -d postgres`
   - `npm --prefix backend run prisma:deploy`
2. Ejecuta el provisionamiento:
   - `npm --prefix backend run provision:admin`

Variables opcionales:

- `OPITA_PROVISION_TENANT_SLUG`
- `OPITA_PROVISION_TENANT_NAME`
- `OPITA_PROVISION_ADMIN_NAME`
- `OPITA_PROVISION_ADMIN_EMAIL`
- `OPITA_PROVISION_ADMIN_PASSWORD`

Defaults:

- tenant: `tenant-local-real / Opita Local Real`
- admin: `admin@local.opita.test / Admin1234!`

El script deja cargados los registros minimos para que `Configuracion` funcione sobre backend real: parametros, capacidades, herramientas, usage, governance, retention y consentimiento.

## Credenciales demo (seed local)

- `solicitante@acme.opita.test / Demo1234!`
- `tecnico@acme.opita.test / Demo1234!`
- `supervisor@acme.opita.test / Demo1234!`
- `admin@acme.opita.test / Demo1234!`

## Notas

- La tabla `audit_events` es append-only a nivel de aplicación.
- Billing sigue fuera de plataforma; se expone atribución y export.
- `contracts:smoke:remote` puede apuntar a este backend local o staging.
