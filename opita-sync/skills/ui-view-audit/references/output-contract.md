# Output Contract

## Severidades

- `crítico`: bloquea comprensión, uso básico, accesibilidad seria o estado esencial del flujo
- `importante`: degrada consistencia, claridad o eficiencia y conviene corregir en el batch actual si el costo es razonable
- `mejora fina`: suma pulido o coherencia, pero no bloquea el cierre inmediato

## Estructura sugerida

### A. Resumen ejecutivo
- superficie auditada
- modo usado
- veredicto general

### B. Hallazgos críticos
- listar solo bloqueantes reales

### C. Inconsistencias visuales
- spacing, jerarquía, iconografía, layout, tokens

### D. Problemas funcionales y de UX
- affordance, estados, feedback, scroll, CTA, edición real

### E. Riesgos de accesibilidad
- contraste, foco, labels, targets, anuncios de estado

### F. Recomendaciones priorizadas
Usar esta plantilla por hallazgo:
- **prioridad**
- **problema detectado**
- **por qué importa**
- **cómo corregirlo**
- **cuándo conviene hacerlo**: `ahora` o `próximo batch`

### G. Cambios puntuales sugeridos
- archivos o componentes probables
- primitives o tokens a reutilizar
- si conviene extraer subcomponente

### H. Plan de refactor o implementación
- solo si el usuario lo pide o si el modo lo exige
- dividir en batches chicos
- cada batch con objetivo, archivos, riesgo y validación barata

## Regla de respuesta

No responder con listas genéricas del tipo “mejorar spacing” sin aterrizar:

- qué está desalineado
- respecto de qué referencia del repo
- qué clase, primitive, estado o patrón conviene usar

## Ejemplos de prompts que deberían disparar la skill

- `Audita esta vista antes de cerrar QA visual.`
- `Revisá esta UI y decime qué inconsistencias tiene.`
- `Analizá esta pantalla de chat y sugerí mejoras concretas.`
- `Pulí esta página y prepará un plan de refactor guiado.`
- `Aplicá en código las correcciones visuales de esta vista.`

## Prompts que NO deberían dispararla

- `Optimizá esta query SQL.`
- `Corregí este adapter del backend.`
- `Configurá este script de infraestructura.`
- `Arreglá la serialización de este servicio.`