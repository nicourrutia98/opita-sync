---
name: implementacion-optima
description: prepara la siguiente implementacion con el perfil de modelo de codex mas adecuado, resuelve gaps de alto impacto con disciplina y aplica exactamente una mejora segura de bajo riesgo cuando aporte valor claro sin desviar el alcance original.
---

# Implementacion Optima

## Objetivo

Preparar la proxima implementacion para que arranque con el modelo/perfil correcto de Codex y con un handoff mas fuerte que el pedido original: gaps cerrados, una mejora segura aplicada si cabe, y un comando de lanzamiento listo para la siguiente sesion o `codex exec`.

## Regla principal

Esta skill no cambia el modelo del chat actual. Usa el router repo-local para seleccionar el perfil de la proxima implementacion.

## Flujo

1. Lee el requerimiento fuente o el request artifact activo.
2. Normaliza el pedido con el criterio de `traductor-tecnico`.
3. Separa:
   - requerimiento original
   - gaps detectados
   - supuestos aceptables
   - decisiones de implementacion
4. Cierra primero gaps `critical` e `important` con defaults de bajo riesgo o dejalos explicitos si no son cerrables.
5. Busca una sola mejora segura:
   - bajo riesgo
   - alto valor
   - no cambia arquitectura
   - no cambia alcance principal
   - mejora testabilidad, claridad contractual, estados, errores u observabilidad basica
6. Si no existe una mejora claramente segura, no la fuerces.
7. Construye el contexto de routing para la proxima implementacion.
8. Genera el comando recomendado para `npm run codex:pick`, `npm run codex:exec:auto` o `npm run codex:chat:auto`.

## Salida requerida

La salida debe incluir siempre:

### 1. Resumen de implementacion
- que se va a implementar
- por que
- tipo de implementacion

### 2. Gaps resueltos
- gap
- impacto
- resolucion aplicada o razon por la que queda abierto

### 3. Mejora segura aplicada
- mejora aplicada
- por que es segura
- valor esperado
- impacto sobre validacion o pruebas

### 4. Riesgos residuales
- lista corta y priorizada

### 5. Routing para la proxima ejecucion
- `implementation_kind`
- `gap_severity`
- `gap_count`
- `improvement_mode`
- `improvement_size`
- perfil/modelo recomendado
- comando exacto de lanzamiento

## Politica de mejora segura

Aplica como maximo una mejora y solo si cumple todo esto:

- no altera el objetivo principal
- no anade integraciones nuevas
- no mete arquitectura extra
- no cambia permisos o seguridad de forma material
- no convierte un patch en un rediseño

Buenas mejoras seguras:
- criterio de aceptacion faltante
- empty/error state explicito
- observabilidad minima
- nota de rollback
- contrato mas claro
- cobertura de test faltante

Malas “mejoras” para esta skill:
- microservicios
- nueva base de datos
- nueva integracion externa
- rediseño de flujo principal
- expansion de alcance de negocio

## Uso del router

Usa `scripts/codex-route.mjs` con estas señales cuando aplique:

- `--implementation-kind`
- `--gap-severity`
- `--gap-count`
- `--improvement-mode`
- `--improvement-size`

## Artefactos recomendados

Cuando el repo use request artifacts, deja o actualiza:

- `implementation-optimization.md`
- `model-routing-decision.json`
- `improvement-note.md`

## Referencias

Consulta:
- `../traductor-tecnico/SKILL.md`
- `references/model-routing-playbook.md`
- `references/safe-improvement-policy.md`
- `references/output-contract.md`
