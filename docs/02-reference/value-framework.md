---
id: reference-value-framework
title: Value Framework
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: pilot-baseline
related_docs:
  - ./market-entry.md
  - ./standard-pilot-spec.md
  - ./plans-and-billing.md
---

# Value Framework

## Proposito

Definir como se medira el valor del piloto de Opita Sync sin reducir la evaluacion a una sola metrica.

## Audiencia

Producto, implementacion, sponsor del piloto y agentes de IA que necesiten argumentar impacto.

## Tipo de documento

Current state.

## Regla de medicion

El piloto debe demostrar fortaleza en varios frentes de valor. No se limita a ahorro de tiempo.

## Regla sobre acciones positivas

- las acciones positivas se miden como ejecuciones tecnicas exitosas de herramientas sin error;
- no son aun la metrica comercial principal del baseline;
- si se adoptan en el futuro como unidad de analisis o monetizacion, deben poder atribuirse a tenant, actor, capacidad, herramienta, modo de ejecucion y resultado.

## Familia de metricas

### Tiempo operativo

- reduccion del tiempo para consultar informacion;
- reduccion del tiempo para diligenciar formularios;
- reduccion del tiempo para cerrar o mover un caso.

### Friccion burocratica

- menos pasos manuales para completar un flujo;
- menor necesidad de navegar programas complejos;
- menor reproceso administrativo.

### Dependencia de personas clave

- menor dependencia de conocimiento informal;
- mayor acceso estandarizado a informacion y acciones permitidas.

### Errores y retrabajo

- menos errores manuales en formularios;
- menos inconsistencias entre consulta, accion y seguimiento;
- menos correcciones por falta de contexto.

### Trazabilidad y control

- mayor visibilidad de actor, tenant, accion y resultado;
- mejor evidencia de cambios y decisiones;
- mejor capacidad de revision posterior.

### Acciones positivas

- cantidad de acciones positivas por tenant;
- cantidad de acciones positivas por capacidad;
- cantidad de acciones positivas por herramienta;
- tasa de confirmacion previa a ejecucion;
- tasa de bloqueo por politica o riesgo;
- tasa de fallo tecnico por herramienta.

### Velocidad operativa

- menor tiempo entre solicitud y primer avance;
- mayor velocidad de seguimiento;
- menor tiempo de respuesta a consultas operativas.

### Adopcion

- metrica principal: casos resueltos por flujo;
- apoyo con volumen de uso por capacidad, roles activos y continuidad de uso.

## Regla de lectura del valor

- el valor del piloto debe leerse como mejora operacional integral;
- ninguna metrica aislada debe presentarse como unica prueba de valor;
- el marco permite seleccionar indicadores concretos por tenant sin alterar las familias base.

## Datos minimos a medir para soportar la evolucion futura

- `tenant_id`
- `user_id`
- `role`
- `intent_code` cuando exista
- `capability_code`
- `tool_code` cuando exista
- `tool_version` cuando exista
- `execution_mode`
- `execution_result`
- `confirmation_required`
- `confirmation_completed`
- `entity_affected`
