# Frontend Architecture

## Primary Choice

Use a web React architecture with Vite as the build tool and Tailwind as the system layer.

## Why This Stack

- It fits the current repository shape without introducing monorepo or native-runtime complexity.
- It keeps deployment simple by building into `site/`, which the current server already knows how to expose.
- It supports Storybook and Playwright cleanly.
- It enables open-code component ownership instead of opaque vendor lock-in.

## What Was Discarded

### Tamagui

Discarded because the repo is not currently a shared native/web codebase and the immediate delivery surface is web.

### gluestack-ui

Discarded for the same reason: its strongest value is cross-platform ownership, which the repo does not yet structurally support.

### Keep Static HTML

Discarded because it cannot scale into a component system, Storybook, or view-level product evolution with acceptable maintainability.

## UI Layering

1. `src/components/ui`
   Open-code primitives and state blocks
2. `src/components/opita`
   Product-specific shells and composed entities
3. `src/domain`
   Stable product types and role/navigation/session contracts
4. `src/services`
   Typed service contracts, auth/session persistence, DTO mapping, stub adapter, and remote adapter
5. `src/hooks`
   Shared async resource orchestration for connected views
6. `src/app.tsx`
   Auth shell, session bootstrap, and view composition
7. `.storybook/` and `stories/`
   Documentation source of truth

## Runtime Data Strategy

- `OpitaAppServices` is the only runtime data contract consumed by views.
- `OpitaAppServices` includes `authService` for sign-in, reset, session lookup, and sign-out.
- `src/domain` holds stable domain types such as cases, metrics, conversation state, roles, tenant config, authenticated user, tenant scope, and session bootstrap.
- `src/services/api` is reserved for transport-level DTOs and endpoint assumptions including `auth/login`, `auth/session`, and password reset routes.
- `src/services/view-models` maps domain data into view-friendly shapes.
- `src/config/app-env.ts` resolves `stub` versus `remote`, auth storage, and QA failure simulation from public env vars and query parameters.
- `src/services/stub` remains the controlled fallback path when backend contracts are unavailable or intentionally simulated, including auth and `401/403` scenarios.
- Session bootstrap is tenant-scoped and resolves role plus allowed views server-side before rendering the operational shell.

## Maintainability Notes

- Components stay small and composable.
- Design tokens live in CSS variables and Tailwind extensions.
- Backend integration now sits behind adapters without reworking primitives or views.
