---
id: reference-capability-governance
title: Capability Governance
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: governance
related_docs:
  - ./standard-pilot-spec.md
  - ./orchestrator-operating-model.md
  - ./product-ownership-and-pilot-terms.md
  - ../06-compliance/data-and-retention-policy.md
---

# Capability Governance

## Proposito

Definir como se gobiernan las capacidades operativas en la version inicial de Opita Sync.

## Audiencia

Producto, implementacion, operaciones y agentes de IA que necesiten validar quien decide, quien despliega y quien responde.

## Tipo de documento

Current state.

## Regla de supervision

Todas las decisiones y responsabilidades sobre capacidades operativas quedan bajo supervision de Opita Code.

## Alcance de gobierno en v1

- Opita Code aprueba nuevas capacidades;
- Opita Code autoriza despliegues;
- Opita Code responde operativamente frente al cliente;
- el cliente no publica capacidades directo en produccion.

## Gobierno de herramientas bajo el orquestador

- toda herramienta debe pertenecer a una capacidad o flujo gobernado;
- toda herramienta debe seguir un estandar del orquestador;
- toda herramienta debe declarar:
  - `tool_code`
  - `tool_version`
  - `risk_level`
  - `execution_mode`
  - `certification_status`
  - `tenant_scope`
  - `permissions_required`
  - `audit_evidence`

## Estados minimos de herramienta

- `draft`
- `reviewed`
- `certified`
- `production`
- `deprecated`

## Modos minimos de ejecucion

- `suggest`
- `confirm_then_execute`
- `auto_execute`

## Clasificacion minima de riesgo

- `read_only`
- `draft_only`
- `write_with_confirmation`
- `auto_executable_low_risk`

## Frontera entre template y capacidad nueva

- template adaptable: configuracion sobre la biblioteca base del producto;
- capacidad nueva: comportamiento nuevo que introduce logica, flujo o efecto operativo no cubierto por templates base;
- desarrollo adicional: nueva capacidad, nueva integracion o reglas complejas de datos fuera del marco base.

## Validacion minima antes de habilitar una capacidad nueva

- objetivo operativo claro;
- actor y permisos definidos;
- tenant scope definido;
- datos y auditoria definidos;
- impacto operativo y responsabilidad definidos.

## Validacion minima antes de habilitar una herramienta en produccion

- capacidad asociada definida;
- contrato tecnico estandar definido;
- riesgo clasificado;
- modo de ejecucion definido;
- revision de IA completada;
- certificacion humana completada;
- evidencia de prueba y rollback definida;
- ambientes de promocion definidos al menos como `draft`, `reviewed`, `production`.

## Rollback y responsabilidad

- cualquier despliegue debe poder ser revertido por Opita Code;
- si una capacidad falla, la respuesta operativa frente al cliente queda bajo supervision de Opita Code;
- la causa del fallo puede clasificarse despues, pero no cambia la responsabilidad de supervision en esta fase.

## Controles de ejecucion insegura

- ninguna herramienta de escritura debe autoejecutarse sin clasificacion explicita de bajo riesgo;
- si falta contexto suficiente, la accion debe bloquearse o requerir confirmacion;
- toda accion sensible debe mostrar contexto e impacto esperado antes de ejecutar;
- ninguna herramienta puede saltar permisos, tenant scope o evidencia de auditoria.

## Roadmap fuera de v1

- publicacion directa de capacidades por cliente;
- studio de capacidades;
- flujo abierto de contribution externa.
