---
id: reference-implementation-proposals
title: Implementation Proposals
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: platform
related_docs:
  - ./context-and-memory-management.md
  - ./standard-pilot-spec.md
  - ./capability-governance.md
---

# Implementation Proposals

## Proposito

Proponer formas implementables de llevar a codigo el manejo de contexto, memoria y llamadas al API de IA en Opita Sync.

## Audiencia

Arquitectura, backend y futuros implementadores.

## Tipo de documento

Current state.

## Propuesta 1. Context builder centralizado

Crear un servicio interno que arme toda llamada al modelo.

Responsabilidades:

- recibir `tenant_id`, `user_id`, `conversation_id` y `capability_id`;
- resolver permisos;
- recuperar contexto reciente;
- recuperar resumen y estado del caso;
- producir el payload final para el proveedor del modelo.

Ventaja:

- un punto unico de control para seguridad, auditoria y calidad de prompts.

## Propuesta 2. Memoria por capas en base de datos

Separar persistencia en cuatro tipos de datos:

- `conversation_messages`
- `conversation_summaries`
- `case_context`
- `audit_events`

Ventaja:

- evita usar el historial crudo como unica fuente;
- permite reconstruir contexto sin mandar todo al modelo.

## Propuesta 3. Resumen incremental por conversacion

Mantener un resumen vivo por conversacion y actualizarlo cada cierto numero de mensajes o cambios de estado.

Ventaja:

- controla costo de contexto;
- reduce longitud del prompt;
- deja trazabilidad de lo importante.

## Propuesta 4. Recuperacion contextual por capacidad

Cada capacidad operativa debe declarar que tipo de contexto necesita:

- mensajes recientes;
- estado del caso;
- formularios;
- documentos;
- registros operativos;
- resultados previos.

Ventaja:

- evita prompts inflados;
- mejora control de permisos;
- permite explicar por que se uso cierto contexto.

## Propuesta 5. Tabla minima de estado conversacional

Mantener una entidad de sesion o conversacion con:

- `conversation_id`
- `tenant_id`
- `user_id`
- `role`
- `active_case_id`
- `last_summary_id`
- `last_capability_id`
- `status`

Ventaja:

- simplifica reanudacion de contexto;
- facilita auditoria y debugging.

## Propuesta 6. Prompt contracts por capacidad

Definir contratos estables para el armado del prompt:

- `system_contract`
- `tenant_contract`
- `capability_contract`
- `context_contract`

Ventaja:

- vuelve repetible la orquestacion;
- evita que cada integracion construya prompts distintos sin control.

## Propuesta 7. Recuperacion con referencias y no con copia total

Cuando el caso tenga mucho historial, pasar al modelo:

- resumen del caso;
- ultimos mensajes relevantes;
- referencias estructuradas a datos recuperados;
- no el historial completo.

Ventaja:

- reduce costo;
- reduce ruido;
- mejora determinismo.

## Propuesta 8. Politica de fallback

Si el contexto no es suficiente o hay ambiguedad:

- pedir aclaracion al usuario;
- no ejecutar acciones sensibles;
- registrar que faltaba contexto.

Ventaja:

- protege la operacion;
- evita ejecuciones inseguras por inferencia excesiva.

## Propuesta 9. Trazabilidad separada de observabilidad

Registrar por separado:

- `audit trail` para negocio y cumplimiento;
- `llm trace` para prompts, modelo, tokens, latencia y errores.

Ventaja:

- evita mezclar evidencia operativa con telemetria tecnica;
- mejora soporte y control de costos.

## Propuesta 10. Camino minimo para v1

La implementacion mas pragmatica para empezar es:

1. tabla de conversaciones;
2. tabla de mensajes;
3. tabla de resumen por conversacion;
4. tabla de eventos de auditoria;
5. servicio `context builder`;
6. plantilla unica de request con capas de contexto.

Esto da una base suficiente para piloto sin depender de memoria libre del proveedor.
