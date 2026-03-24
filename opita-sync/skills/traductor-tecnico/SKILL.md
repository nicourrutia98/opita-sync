---
name: traductor-tecnico
description: transforma descripciones naturales, notas sueltas, briefs de producto o ideas de proyecto en especificaciones técnicas y documentación de desarrollo listas para implementar por agentes de ia o equipos de ingeniería. usa esta skill cuando el usuario trae una idea ambigua, lenguaje de negocio, requisitos incompletos, peticiones de stakeholders, o quiere convertir un proyecto en arquitectura, backlog, contratos, criterios de aceptación, plan de implementación o diseño de una skill, herramienta mcp o sistema de software. también úsala cuando necesites comprobar que la documentación final sigue fielmente los requerimientos originales y no introduce omisiones, invenciones o ambigüedad peligrosa para desarrollo.
---

# Traductor Tecnico

## Objetivo

Convierte lenguaje natural de proyecto en una especificación técnica accionable, verificable y fácil de ejecutar por IA o por un equipo técnico. Después, comprueba que la documentación final sigue fielmente los requerimientos originales antes de darla por lista para desarrollar.

## Flujo

Sigue este flujo en orden:

1. **Extraer intención y restricciones**
   - Identifica objetivo, usuario, problema, entregable, límites, señales de éxito, entradas, salidas y dependencias implícitas.
   - Separa hechos, preferencias, supuestos e inferencias.
   - Si el usuario mezcla idea, wish-list y solución propuesta, separa cada capa.

2. **Normalizar el lenguaje**
   - Reescribe frases vagas como requisitos comprobables.
   - Sustituye adjetivos vagos por criterios operables. Ejemplos:
     - "rápido" -> objetivo de latencia, tiempo de respuesta o complejidad esperada
     - "escalable" -> volumen esperado, concurrencia, multi-tenant, límites y estrategia de crecimiento
     - "simple" -> menos componentes, menor superficie operativa, onboarding corto, menos pasos

3. **Detectar gaps de información**
   - Clasifica cada gap por impacto:
     - **crítico**: cambia arquitectura, seguridad, datos, costos, criterio de aceptación o factibilidad
     - **importante**: cambia el diseño pero no bloquea un primer plan
     - **menor**: detalle que puede resolverse con un default razonable
   - No intentes cerrar todos los gaps. Cierra primero los de mayor impacto.

4. **Cerrar gaps con disciplina**
   - Usa primero el contexto disponible en la conversación y supuestos razonables de bajo riesgo.
   - Si existe una skill complementaria de cierre de gaps, úsala solo para gaps críticos o importantes que cambien la solución.
   - Si un gap sigue abierto, no lo escondas: conviértelo en supuesto explícito o en pregunta abierta priorizada.

5. **Compilar el brief técnico**
   - Entrega una especificación coherente con alcance, flujos, modelo de datos, interfaces, arquitectura, plan de trabajo y validación.
   - Prefiere la solución mínima viable que preserve claridad y extensibilidad.

6. **Construir trazabilidad antes de validar**
   - Convierte cada requerimiento fuente en una unidad trazable.
   - Mapea para cada unidad:
     - origen
     - interpretación técnica
     - sección de la documentación donde quedó resuelta
     - estado: `cubierto | parcialmente_cubierto | no_cubierto | contradicho | inventado`
   - Si un requerimiento compuesto mezcla varias ideas, sepáralo antes de mapear.

7. **Ejecutar el comprobador robusto de fidelidad documental**
   - Evalúa la documentación contra el requerimiento fuente con estas categorías:
     - **omisión**: falta un requerimiento explícito o implícito de alto impacto
     - **invención**: aparece una capacidad, restricción o decisión no sustentada
     - **distorsión**: la documentación cambia el significado o reduce el alcance sin declararlo
     - **ambigüedad residual**: el texto sigue siendo interpretable de varias maneras por un implementador
     - **no implementabilidad**: hay intención, pero no suficiente precisión para construir, probar o aceptar
   - No cierres la revisión con frases genéricas. Señala exactamente qué parte falla, por qué importa y cómo corregirla.

8. **Estresar la especificación antes de responder**
   - Busca contradicciones, estados faltantes, permisos, errores, casos borde, dependencias invisibles y fallas de observabilidad.
   - Comprueba que la salida sea implementable, no solo elegante.
   - Si la documentación no supera la revisión, devuelve versión corregida y reporte de fidelidad; no la presentes como lista.

## Reglas de decisión

- No confundas una idea con un requerimiento. Convierte cada idea en una afirmación implementable o en un supuesto explícito.
- No inventes complejidad. Si la entrada no exige microservicios, colas, event sourcing o múltiples agentes, no los propongas por defecto.
- Cuando el stack no esté definido, elige uno solo y justifícalo por simplicidad de implementación.
- Siempre distingue entre:
  - **hecho confirmado**
  - **supuesto recomendado**
  - **decisión de diseño propuesta**
- Cuando el usuario quiera algo para IA que luego se implemente, incluye secciones legibles por humanos y por agentes.
- Evita frases vacías como "seguir mejores prácticas". Sustitúyelas por decisiones concretas.
- Si la solución depende de contexto externo, deja claro qué parte requiere una herramienta o MCP y qué parte puede resolverse solo con la skill.
- No marques una documentación como lista para desarrollo si tiene vacíos en seguridad, estados, contratos, criterios de aceptación o definición de datos.
- Si detectas conflicto entre lo que el usuario pidió y lo que la documentación afirma, prioriza el requerimiento fuente y corrige la documentación.

## Regla para skill vs MCP

Usa esta distinción:

- **Skill** para razonamiento, traducción, trazabilidad, priorización y redacción de la especificación.
- **MCP** para capacidades determinísticas o externas, como:
  - traer contexto vivo de repositorios, docs, tickets o bases de datos
  - validar contratos o esquemas
  - exportar artefactos estructurados
  - ejecutar verificaciones repetibles de fidelidad documental

Por defecto, recomienda **skill primero** y **MCP después**. Promueve una parte a MCP solo si la tarea necesita integración externa, validación determinística o reutilización operacional frecuente.

Consulta [references/pack-optimo.md](references/pack-optimo.md) cuando el usuario pregunte por el pack más eficiente.
Consulta [references/output-contract.md](references/output-contract.md) cuando necesites una salida altamente estructurada.
Consulta [references/mcp-blueprint.md](references/mcp-blueprint.md) cuando el usuario quiera convertir esta lógica en herramienta MCP.
Consulta [references/doc-fidelity-checker.md](references/doc-fidelity-checker.md) cuando necesites revisar si la documentación está fielmente apegada al requerimiento original.

## Salida por defecto

Usa esta estructura salvo que el usuario pida otra:

### 1. Resumen técnico
Una explicación corta del sistema o feature propuesto, en lenguaje técnico claro.

### 2. Objetivo y resultado esperado
Qué se quiere lograr y cómo se medirá el resultado.

### 3. Alcance y no alcance
Qué entra en esta iteración y qué queda fuera.

### 4. Actores y flujos
Usuarios, sistemas y secuencia principal de interacción.

### 5. Requerimientos funcionales
Lista clara y comprobable de capacidades.

### 6. Requerimientos no funcionales
Seguridad, rendimiento, confiabilidad, observabilidad, mantenibilidad y costos si aplica.

### 7. Modelo de dominio y datos
Entidades, relaciones, estados, eventos, inputs y outputs.

### 8. Arquitectura recomendada
Componentes, límites, integraciones y justificación del stack.

### 9. Contratos e interfaces
APIs, eventos, payloads, esquemas, archivos, comandos o superficies de interacción.

### 10. Plan de implementación
Fases, orden de construcción, dependencias y quick wins.

### 11. Criterios de aceptación y pruebas
Casos verificables que definan "terminado".

### 12. Matriz de trazabilidad
Mapa de requerimientos fuente -> cobertura documental -> estado.

### 13. Reporte de fidelidad documental
Incluye:
- omisiones detectadas
- invenciones detectadas
- contradicciones o distorsiones
- ambigüedades peligrosas
- bloqueantes de implementación
- score de readiness solo si justificas el número

### 14. Riesgos, supuestos y gaps abiertos
Lista priorizada con impacto.

### 15. Prompt listo para agente implementador
Cierra con un bloque reutilizable para un agente de código cuando eso ayude a ejecutar.

## Ajustes por tipo de petición

### Si el usuario pide una **skill**
Añade:
- disparadores de uso
- instrucciones compactas y operativas
- recursos de referencia necesarios
- límites y reglas de calidad
- estructura final del paquete
- verificación de fidelidad entre requerimiento original y comportamiento esperado de la skill

### Si el usuario pide una **herramienta MCP**
Añade:
- herramientas exactas que expondrá el servidor
- inputs y outputs por herramienta
- qué debe ser tool, qué debe ser resource y qué debe ser prompt
- transporte recomendado
- autenticación y permisos
- validaciones determinísticas y manejo de errores
- estrategia de trazabilidad entre input fuente y documentación exportada

### Si el usuario pide algo para **agentes de código**
Añade:
- mapa de módulos o archivos
- contratos de entrada/salida
- subtareas ordenadas
- estrategia de test
- definición de listo por tarea
- chequeos para asegurar que el plan implementa el requerimiento y no una interpretación desviada

## Patrón de calidad

Una buena traducción técnica debe cumplir todo esto:

- reduce ambigüedad
- conserva intención de negocio
- deja decisiones explícitas
- convierte lenguaje subjetivo en criterios verificables
- produce una ruta clara de implementación
- deja visibles los riesgos y lo que sigue incierto
- mantiene trazabilidad entre requerimiento original y documentación final
- no añade capacidades no pedidas sin marcarlas como propuesta opcional

## Mini ejemplo

**Entrada:**
"Quiero una app que ayude a equipos a automatizar soporte por WhatsApp y que luego escale a varios clientes."

**Buena traducción técnica:**
- Sistema multi-tenant para automatización asistida de soporte por WhatsApp.
- Cada tenant configura canales, prompts, herramientas y políticas propias.
- Requiere aislamiento de datos por tenant, panel administrativo, trazabilidad de conversaciones, fallback a humano y métricas operativas.
- Primera versión: enrutamiento, base de conocimiento, acciones simples, auditoría y handoff.
- No alcance inicial: billing, analítica avanzada, voz, entrenamiento fino.

**Buena comprobación de fidelidad:**
- `escale a varios clientes` quedó cubierto por multi-tenant y aislamiento de datos.
- `automatizar soporte por WhatsApp` quedó cubierto por canal, handoff y trazabilidad.
- No se añadió voz ni entrenamiento fino como requisito; quedaron explícitamente fuera de alcance.
- Si la documentación omitiera el fallback a humano, el estado sería `parcialmente_cubierto` o `no_cubierto` según el resto del diseño.

Usa ese nivel de precisión o más.
