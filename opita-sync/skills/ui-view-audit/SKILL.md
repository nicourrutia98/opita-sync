---
name: ui-view-audit
description: audita y refina vistas, pantallas y layouts del frontend de Opita Sync cuando la tarea sea construir, rediseñar, pulir o revisar una UI, página, flujo conversacional, dashboard, formulario, sidebar o componente visual. úsala para detectar inconsistencias visuales, estados faltantes, problemas funcionales y de UX, accesibilidad, microcopy y desalineación con el design system real del repo, y para proponer o ejecutar correcciones solo cuando se pida explícitamente. no la uses para backend, infraestructura, consultas, adapters, servicios o cambios sin superficie visual.
---

# UI View Audit

## Objetivo

Auditar y mejorar vistas del producto con grounding real en este repo: tokens Tailwind/CSS, primitives open-code, shells de producto, stories, pruebas visuales y políticas de cierre UI. Por defecto, esta skill **audita y propone**. Solo entra en modo ejecución si la tarea pide aplicar cambios en código.

## Modo de operación

Elegí el modo más chico que resuelva el pedido:

1. **Auditoría**
   - Analizar la vista y devolver hallazgos priorizados.
   - No modificar código.
2. **Propuesta**
   - Además de auditar, sugerir ajustes concretos de layout, componentes, estados, microcopy y accesibilidad.
   - No modificar código.
3. **Refactor guiado**
   - Preparar un plan de implementación por batches con riesgos, dependencias y validaciones.
   - No modificar código.
4. **Ejecución**
   - Aplicar cambios solo si el usuario lo pide de forma explícita.
   - Antes de editar, respetar `C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync\AGENTS.md`: crear o actualizar artifacts por request cuando corresponda, escribir spec antes de cambios de comportamiento o workflow, y validar en batches chicos.

## Contexto del repo a respetar

Tomá estas decisiones como base y no inventes otra arquitectura:

- **Framework**: React 19 + Vite + TypeScript.
- **Styling**: Tailwind + tokens en `src/index.css` + extensiones en `tailwind.config.ts`.
- **Sistema UI**: primitives open-code en `src/components/ui`, composición de producto en `src/components/opita`.
- **Data/runtime**: `@tanstack/react-query` + estado local; no asumir Redux, Zustand u otro store global.
- **Navegación**: por estado en `src/app.tsx`; no asumir `react-router`.
- **Formularios**: manuales; no asumir `react-hook-form` o Formik.
- **Validación visual existente**: Storybook + Playwright visual/a11y.
- **MCPs opcionales**: `playwright` para evidencia visual/runtime y `spec_hub` para artefactos estructurados. Nunca dependas de ellos para que la skill funcione.

Antes de opinar o editar, revisá `references/repo-ui-context.md`. Si la vista es compleja o conversacional, cargá también `references/review-checklists.md`. Si necesitás estructurar la respuesta o preparar handoff, cargá `references/output-contract.md`.

## Cuándo usarla

Activala cuando el trabajo involucre una **superficie visual** del frontend, por ejemplo:

- construir o rediseñar una vista
- auditar una pantalla antes de cerrarla
- pulir una página o dashboard
- revisar una UI o flujo conversacional
- corregir inconsistencias visuales
- mejorar UX funcional de formularios, sidebars o listas
- refinar estados loading, empty, error, success, selected, disabled o streaming
- verificar que una vista respete el design system real del repo

Prompts típicos:

- `audita esta vista`
- `revisa esta UI`
- `qué inconsistencias tiene esta pantalla`
- `qué mejorarías en este rediseño`
- `analiza esta vista de chat`
- `sugerí mejoras de UX para este dashboard`
- `refiná esta vista antes de entregarla`

## Cuándo NO usarla

No la actives para tareas sin superficie visual clara, por ejemplo:

- lógica de backend pura
- adapters, servicios, queries o SQL
- scripts de infraestructura
- tuning de performance sin impacto visible en UI
- cambios solo de dominio, contratos, seeders o persistencia
- automatizaciones o tooling que no toquen una vista, layout o componente visual

## Flujo de análisis

Seguí este flujo en orden:

1. **Definir superficie y objetivo**
   - Identificar qué vista, flujo o componente se está evaluando.
   - Separar si el pedido es auditoría, propuesta, refactor guiado o ejecución.
   - Aclarar si la revisión es estática (código/stories) o también runtime (Playwright).

2. **Hacer grounding en el repo**
   - Localizar la vista objetivo y su shell.
   - Detectar qué primitives, tokens, stories, tests visuales y criterios de AGENTS aplican.
   - Comparar con componentes hermanos antes de proponer algo nuevo.

3. **Revisar estructura y estados reales**
   - Verificar jerarquía visual, layout, scroll y distribución del espacio.
   - Verificar estados loading, empty, error, success, disabled, selected, active y, si aplica, streaming/chat.
   - Confirmar si la UI parece editable/interactiva y si el comportamiento real coincide.

4. **Auditar consistencia con el sistema**
   - Reusar primitives y patrones existentes antes de crear wrappers o estilos ad hoc.
   - Validar tokens, radios, sombras, gaps, paddings, copy y tratamiento iconográfico.
   - Detectar hardcodes evitables o divergencias con vistas equivalentes.

5. **Evaluar accesibilidad y UX funcional**
   - Contraste, foco visible, targets clicables, `aria-label` cuando corresponda, claridad de CTA, feedback y mensajes de ayuda.
   - En chat/dashboard/forms/sidebar, aplicar la checklist específica de `references/review-checklists.md`.

6. **Priorizar y responder con acción**
   - Clasificar cada hallazgo como `crítico`, `importante` o `mejora fina`.
   - Para cada hallazgo: describir problema, por qué importa, cómo corregirlo y si conviene resolverlo ahora o después.
   - Si el usuario pidió ejecución, transformar recomendaciones en batches de cambio concretos y conservadores.

## Reglas de decisión

- No propongas MUI, Chakra, Ant ni otro sistema ajeno si la vista puede resolverse con el sistema open-code actual.
- No inventes tokens, colores, radios o sombras cuando ya existan equivalentes en `src/index.css` y `tailwind.config.ts`.
- No critiques una vista solo por gusto visual; aterrizá cada observación en consistencia, legibilidad, affordance, accesibilidad, estados o mantenibilidad.
- No confundas un placeholder lindo con un empty state resuelto.
- No des por buena una pantalla si el estado visual promete algo que el estado funcional no cumple.
- No cierres una vista sin revisar loading, empty, error y success cuando el flujo lo requiera.
- Si hay varias mejoras válidas, preferí la de menor riesgo y mayor alineación con el sistema ya existente.
- Si una mejora exige cambio de comportamiento, dejá explícito que requiere spec/request artifact antes de implementarla.

## Checklist mínima obligatoria

Como piso, cubrí siempre estos puntos:

- contraste de iconos y texto en estados activos o seleccionados
- padding interno de `Input` y `Textarea`, especialmente en flujos densos
- placeholders útiles y empty states reales
- consistencia entre `disabled` y `loading`
- coherencia entre título principal, subtítulos, labels y descripciones
- distribución vertical, respiración y espacios muertos
- scroll interno en la zona correcta
- composer fijo abajo en chats y estabilidad del hilo
- diferencias entre estado visual y estado funcional real
- microcopy ambiguo o redundante
- alineación entre iconos y texto
- foco visible y estados `hover/focus/active`
- estados activos/inactivos coherentes
- consistencia entre panel principal y sidebar
- jerarquía entre headings y descripciones
- claridad entre CTA principal y CTA secundario

La checklist completa por patrón vive en `references/review-checklists.md`.

## Herramientas y referencias

Leé según el caso:

- `references/repo-ui-context.md`
  - stack real, tokens, primitives, stories, tests y límites del repo
- `references/review-checklists.md`
  - checklist detallada para vistas generales, chat, dashboard, formularios y sidebars
- `references/output-contract.md`
  - formato de salida, severidades, criterios de priorización y ejemplos de prompts

Usá herramientas opcionales solo cuando agreguen valor:

- **Playwright MCP** para ver layout real, scroll, foco, estados o problemas que no se confirman solo leyendo código.
- **spec_hub** para registrar hallazgos estructurados o dejar trazabilidad adicional.

Si esos MCPs no están disponibles, seguí igual con revisión de código, stories y pruebas existentes.

## Formato de salida por defecto

Respondé con esta estructura salvo que el usuario pida otra:

### A. Resumen ejecutivo
- qué superficie se auditó
- qué modo se usó
- veredicto general en 2 a 4 bullets

### B. Hallazgos críticos
- solo problemas que bloquean claridad, uso, accesibilidad o estados esenciales

### C. Inconsistencias visuales
- spacing, alineación, jerarquía, tokens, iconografía, layout

### D. Problemas funcionales y de UX
- affordance, feedback, estados, claridad de interacción, scroll, composer, CTA

### E. Riesgos de accesibilidad
- contraste, foco, labels, targets, lectura, feedback de estado

### F. Recomendaciones priorizadas
Para cada punto incluir:
- **prioridad**: `crítico | importante | mejora fina`
- **problema detectado**
- **por qué importa**
- **cómo corregirlo**
- **cuándo conviene hacerlo**: `ahora | próximo batch`

### G. Cambios puntuales sugeridos
- componentes a tocar
- tokens o patterns a reutilizar
- si conviene extraer subcomponente o solo ajustar composición

### H. Plan de refactor o implementación
- solo cuando el usuario lo pida o cuando el modo sea refactor guiado / ejecución

## Ejemplos de uso

- `Usá $ui-view-audit para auditar esta vista de chat antes de cerrarla.`
- `Usá $ui-view-audit en modo propuesta para sugerir mejoras de UX en este dashboard.`
- `Usá $ui-view-audit en modo refactor guiado para planear cómo corregir inconsistencias visuales en esta pantalla.`
- `Usá $ui-view-audit en modo ejecución para aplicar los ajustes de layout y estados faltantes en esta vista.`

## Patrón de calidad

Una buena auditoría de esta skill:

- baja al código y al sistema real del repo
- separa hallazgos visuales, funcionales y de accesibilidad
- evita recomendaciones genéricas o de gusto personal
- prioriza mejoras concretas y aplicables
- deja claro qué se corrige ahora y qué puede esperar
- no depende de MCPs para ser útil
- protege la coherencia del design system real