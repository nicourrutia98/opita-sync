# Next Chat Context

## Current objective

Retomar exactamente desde el punto en que:

- la documentacion frontend ya fue alineada con la vision actual del orquestador;
- el backend ya expone los contratos minimos que el frontend necesita;
- existe una primera implementacion real de frontend en `Expo shared`;
- el siguiente paso natural es QA real del frontend y continuar refinando implementacion.

## What was just completed

### 1. Frontend docs were updated to match the orchestrator runtime

Se corrigieron estos documentos para reflejar:
- `suggest`
- `blocked`
- `requires_confirmation`
- `success`
- `request_create` con confirmacion obligatoria
- admin de tools, confirmaciones y ejecuciones

Archivos principales:
- [tech-docs/07-frontend/frontend-flow-map.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/tech-docs/07-frontend/frontend-flow-map.md)
- [tech-docs/07-frontend/wireflow-spec.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/tech-docs/07-frontend/wireflow-spec.md)
- [tech-docs/07-frontend/screen-inventory.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/tech-docs/07-frontend/screen-inventory.md)
- [tech-docs/07-frontend/ui-interface-contracts.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/tech-docs/07-frontend/ui-interface-contracts.md)
- [tech-docs/07-frontend/README.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/tech-docs/07-frontend/README.md)
- [tech-docs/06-validation/frontend-input-pack-validation-report.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/tech-docs/06-validation/frontend-input-pack-validation-report.md)

### 2. Backend was extended for frontend settings and shell data

Se agregaron:
- `GET /api/auth/me/ui-profile`
- `PATCH /api/auth/me/ui-profile`
- `GET /api/tenants/current/ui-baseline`
- `PATCH /api/tenants/current/ui-baseline`
- `GET /api/conversations`
- `GET /api/cases`

Archivos principales:
- [backend/src/auth/auth.controller.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/auth/auth.controller.ts)
- [backend/src/auth/auth.service.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/auth/auth.service.ts)
- [backend/src/tenant-settings/tenant-settings.controller.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/tenant-settings/tenant-settings.controller.ts)
- [backend/src/tenant-settings/tenant-settings.service.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/tenant-settings/tenant-settings.service.ts)
- [backend/src/conversations/conversations.controller.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/conversations/conversations.controller.ts)
- [backend/src/conversations/conversations.service.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/conversations/conversations.service.ts)
- [backend/src/cases/cases.controller.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/cases/cases.controller.ts)
- [backend/src/cases/cases.service.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/src/cases/cases.service.ts)
- [backend/prisma/migrations/20260323004500_ui_profile_and_baseline/migration.sql](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/backend/prisma/migrations/20260323004500_ui_profile_and_baseline/migration.sql)

### 3. First Expo frontend implementation now exists

Se creo `frontend/` como app Expo shared con:
- router
- session provider
- typed API client
- workspace chat-first
- `status_query`
- `request_create` con `requires_confirmation -> confirm`
- admin de tools
- confirmaciones
- execution audit
- profile/accessibility/tenant settings

Archivos principales:
- [frontend/README.md](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/README.md)
- [frontend/app/_layout.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/app/_layout.tsx)
- [frontend/app/auth.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/app/auth.tsx)
- [frontend/src/providers/session-provider.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/providers/session-provider.tsx)
- [frontend/src/lib/api.ts](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/lib/api.ts)
- [frontend/src/components/app-frame.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/components/app-frame.tsx)
- [frontend/src/features/workspace/workspace-screen.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/features/workspace/workspace-screen.tsx)
- [frontend/src/features/admin/tools-screen.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/features/admin/tools-screen.tsx)
- [frontend/src/features/admin/operations-screens.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/features/admin/operations-screens.tsx)
- [frontend/src/features/settings/settings-screens.tsx](C:/Users/nicou/OneDrive/Documentos/MO%20Project/Opita%20Sync/frontend/src/features/settings/settings-screens.tsx)

## Visual/product constraints that must be preserved

- `chat-first`
- menor saturacion posible en pantalla principal
- el chat debe ser la fuente principal de informacion
- panel derecho colapsable y solo de resumen/contexto
- acentos teal, no azul saturado
- `Flow Grid v3` sigue siendo la base visual provisional

## Verification already completed

### Backend

Se verifico con DB local en `localhost:54329`:
- `npm run build`
- `npx prisma migrate reset --force`
- `npm test -- --runInBand`
- `npm run test:e2e:jest -- --runInBand`
- `npm run test:e2e`

### Frontend

Se verifico:
- `npm run typecheck`
- `npx expo export --platform web`

## Important current caveats

- el login frontend actual no usa aun Firebase Web SDK directo;
- la pantalla de auth hoy pide pegar un `Firebase ID token` o token de prueba del backend;
- `frontend/.git` quedo anidado porque `create-expo-app` lo creo y no se pudo borrar desde este runner;
- no se hizo aun QA real en navegador sobre flujos;
- falta refinamiento visual y QA de accesibilidad en ejecucion real.

## Recommended next step

Continuar desde aqui con este orden:

1. levantar backend y frontend juntos;
2. correr QA real del frontend en navegador;
3. ajustar bugs de integracion;
4. despues refinar auth real con Firebase SDK en frontend;
5. luego seguir con mobile parity y accesibilidad profunda.

## Useful commands

### Backend

```powershell
cd backend
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:54329/opita_sync?schema=public'
$env:JWT_ACCESS_SECRET='abcdefghijklmnopqrstuvwxyz123456'
$env:FIREBASE_MOCK_USERS_JSON='{"firebase-admin-token":{"uid":"firebase-admin-uid","email":"admin@opitasync.test","name":"Opita Admin"},"firebase-member-token":{"uid":"firebase-member-uid","email":"member@opitasync.test","name":"Opita Member"}}'
npm run start:dev
```

### Frontend

```powershell
cd frontend
$env:EXPO_PUBLIC_API_BASE_URL='http://localhost:3000/api'
npm run web
```

## If continuing in another chat

Pedir explicitamente:

`Retoma desde NEXT_CHAT_CONTEXT.md. Quiero seguir con QA del frontend y luego cerrar auth real con Firebase en Expo.`
