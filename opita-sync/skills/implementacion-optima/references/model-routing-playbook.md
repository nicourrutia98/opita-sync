# Model Routing Playbook

## Objetivo

Traducir una recomendacion de implementacion en senales concretas para `scripts/codex-route.mjs`.

## Mapeo recomendado

- `small_patch`
  - un cambio localizado
  - 1 a 3 archivos
  - bajo riesgo
- `feature`
  - capacidad nueva sin reconfigurar arquitectura
- `refactor`
  - reorganizacion con riesgo de regresion
- `architecture`
  - decisiones estructurales o diseno base
- `audit`
  - revision, verificacion o code review
- `migration`
  - cambios de contrato, datos o rollout
- `frontend_ui`
  - implementacion o ajuste de interfaz
- `backend_api`
  - endpoint, contrato backend o adaptador

## Regla de score

- gaps `important` o `critical` deben empujar hacia perfiles mas profundos
- una mejora segura aplicada aumenta un poco el score, no lo dispara por si sola
- muchas superficies, herramientas o riesgo alto pesan mas que la mejora

## Salida util

Siempre deja:
- perfil recomendado
- modelo
- reasoning effort
- rationale codes
- comando `codex` listo para copiar
