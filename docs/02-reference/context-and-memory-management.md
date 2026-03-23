---
id: reference-context-and-memory-management
title: Context And Memory Management
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: platform
related_docs:
  - ./standard-pilot-spec.md
  - ./capability-governance.md
  - ../06-compliance/data-and-retention-policy.md
---

# Context And Memory Management

## Proposito

Definir como Opita Sync debe manejar el contexto de IA por usuario, conversacion y caso cuando el proveedor del modelo se consume por API.

## Audiencia

Producto, arquitectura, backend e implementacion.

## Tipo de documento

Current state.

## Regla principal

Opita Sync no delega la memoria operativa al proveedor de IA. El modelo no es la fuente de verdad del contexto. La plataforma reconstruye el contexto en cada request.

## Identidad minima por request

Toda invocacion al modelo debe quedar asociada a:

- `tenant_id`
- `user_id`
- `role`
- `conversation_id`
- `case_id` o `entity_id` cuando aplique
- `capability_id`

## Capas de contexto

### 1. Contexto base del producto

- reglas del sistema;
- identidad de Opita Sync;
- instrucciones de seguridad y gobierno.

### 2. Contexto del tenant

- configuracion del tenant;
- parametros habilitados;
- templates vigentes;
- restricciones de negocio del tenant.

### 3. Contexto del usuario y del caso

- rol y permisos;
- estado actual del caso;
- mensajes recientes;
- resumen de conversacion;
- datos recuperados del flujo operativo.

## Tipos de contexto y ciclo de vida

### Persistencia operativa

- historial de mensajes;
- estado del caso;
- entidades y referencias operativas;
- vive en la base de datos del producto;
- se conserva segun retencion y auditoria.

### Resumen derivado

- resumen de conversacion;
- decisiones consolidadas;
- contexto sintetizado para reducir costo;
- se recalcula o actualiza segun evolucion del caso.

### Contexto efimero de request

- payload final enviado al modelo;
- resultado de la recuperacion puntual;
- mensajes recientes estrictamente necesarios;
- existe solo para la llamada actual.

## Regla de precedencia

La prioridad del contexto para construir un request es:

1. reglas del producto;
2. reglas del tenant;
3. permisos del usuario;
4. estado del caso o entidad;
5. resumen derivado;
6. mensajes recientes;
7. solicitud actual del usuario.

## Regla de memoria corta

- usar ventana reciente de mensajes relevantes;
- incluir resumen cuando la conversacion crezca;
- no enviar historiales completos si no aportan al paso actual.

## Regla de memoria larga

Persistir fuera del modelo:

- historial de mensajes;
- resumen por conversacion;
- decisiones tomadas;
- entidades creadas o modificadas;
- eventos de auditoria relacionados;
- referencias a documentos o registros consultados.

## Regla de recuperacion

Antes de llamar al modelo, el backend debe:

1. identificar tenant, usuario, rol y conversacion;
2. resolver la capacidad operativa involucrada;
3. recuperar solo contexto relevante;
4. filtrar por permisos;
5. construir el prompt final.

## Regla de aislamiento

- no mezclar historiales entre tenants;
- no compartir resumentes entre usuarios si no existe una regla explicita del flujo;
- no recuperar documentos o registros de otro tenant;
- no usar memoria libre del proveedor como si fuera estado operativo confiable.

## Regla de auditoria por llamada

Toda llamada al modelo debe poder auditar:

- identidad minima del request;
- contexto recuperado o referencias usadas;
- proveedor o modelo invocado;
- resultado de la llamada;
- accion operativa derivada si existio.

## Formula de construccion del request

```text
request_to_model =
product_rules
+ tenant_rules
+ user_permissions
+ case_state
+ retrieved_context
+ recent_messages
+ current_user_request
```

## Decision explicita

La memoria del sistema vive en Opita Sync, no en la API del modelo.
