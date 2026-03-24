# Repo UI Context

## Stack real

- React 19 + Vite + TypeScript
- Tailwind CSS con tokens en `src/index.css` y extensiones en `tailwind.config.ts`
- Primitives open-code en `src/components/ui`
- Composición de producto en `src/components/opita`
- `@tanstack/react-query` para data/runtime + estado local en vistas
- Navegación por estado desde `src/app.tsx`
- Storybook para documentación visual
- Playwright para pruebas visuales y de accesibilidad

## Dónde mirar primero

### Tokens y reglas visuales
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\index.css`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\tailwind.config.ts`

Tokens disponibles:
- `ink`, `muted`, `subtle`
- `paper`, `panel`, `surface`, `line`
- `brand`, `brand.strong`, `brand.soft`
- `success`, `warning`, `danger`, `info`
- sombras: `shadow-panel`, `shadow-soft`
- radios: `rounded-shell`, `rounded-panel`

### Primitives oficiales
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\ui\button.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\ui\input.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\ui\textarea.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\ui\card.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\ui\badge.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\ui\state-block.tsx`

### Shells y vistas de producto
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\app-shell.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\auth-shell.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\metric-card.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\case-card.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\chat\chat-shell.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\chat\composer.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\src\components\opita\chat\recent-chats-sidebar.tsx`

### Historias y referencias visuales
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\app-shell.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\auth-shell.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\button.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\case-card.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\flow-patterns.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\metric-card.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\state-block.stories.tsx`
- `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\stories\opita-app.stories.tsx`

### Validación existente
- visual: `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\tests\visual\opita-sync.visual.spec.ts`
- a11y: `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\tests\a11y\opita-sync.a11y.spec.ts`
- política frontend: `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\AGENTS.md`
- arquitectura frontend: `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\docs\specs\opita-sync\frontend-architecture.md`

## Heurísticas de adaptación

- Reusar primitives antes de crear wrappers nuevos.
- Reusar `StateBlock` para loading, empty y error cuando la UI lo permita.
- Preferir tokens Tailwind/CSS del repo antes que valores hardcodeados.
- No asumir `react-router`; revisar la navegación real por `ViewKey` y composición en `src/app.tsx`.
- No asumir formularios controlados por librerías; revisar handlers manuales.
- Si una mejora requiere cambio de workflow o comportamiento, seguir la política del `AGENTS.md` local antes de editar.

## MCPs disponibles, pero opcionales

- `playwright` en `.codex/config.toml`: útil para ver layout real, foco, scroll o estados runtime.
- `spec_hub` en `.codex/config.toml`: útil para exportar hallazgos o trazabilidad estructurada.
- `openaiDeveloperDocs` existe, pero rara vez aporta a esta skill.

No hagas a la skill dependiente de ningún MCP. Primero auditá con código, stories y tests existentes.