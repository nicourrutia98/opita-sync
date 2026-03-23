---
id: reference-orchestrator-operating-model
title: Orchestrator Operating Model
status: approved-baseline
owner: product
last_updated: 2026-03-22
applies_to: platform
related_docs:
  - ../00-overview/product-blueprint.md
  - ./standard-pilot-spec.md
  - ./capability-governance.md
  - ./context-and-memory-management.md
---

# Orchestrator Operating Model

## Proposito

Fijar el modelo conceptual del orquestador para completar la vision objetivo del producto sin confundirlo con capacidades ya implementadas.

## Audiencia

Producto, arquitectura, implementacion, comercial y agentes de IA que necesiten distinguir entre baseline actual y modelo objetivo del producto.

## Tipo de documento

Current state para el modelo conceptual y target operating model para la evolucion del producto.

## Conceptos canonicos

### Intencion

- objetivo expresado por el usuario en lenguaje natural o por entrada estructurada;
- no ejecuta nada por si sola;
- debe resolverse a una capacidad operativa compatible con rol, tenant y contexto.

### Capacidad operativa

- contrato funcional gobernado que resuelve un tipo de trabajo;
- define actores, permisos, datos, auditoria y criterios de exito;
- puede usar una o varias herramientas;
- no equivale a una integracion tecnica aislada.

### Herramienta

- ejecucion tecnica estandarizada que consulta o actua sobre un sistema;
- opera bajo un estandar del orquestador;
- debe declarar version, riesgo, permisos, tenant scope, datos tocados y rollback posture;
- no debe quedar como prompt ad hoc sin contrato.

### Politica de accion

- regla que decide si la herramienta:
  - se sugiere;
  - requiere confirmacion antes de ejecutar;
  - puede autoejecutarse por bajo riesgo y configuracion aprobada.

## Modos de operacion

### `suggest`

- el sistema propone la herramienta o accion;
- no ejecuta mutacion;
- sirve para consulta, borradores o pasos previos a una confirmacion.

### `confirm_then_execute`

- el sistema presenta contexto, herramienta, impacto esperado y accion propuesta;
- el usuario o actor autorizado confirma;
- solo despues ejecuta.

### `auto_execute`

- reservado para acciones de bajo riesgo;
- solo aplica cuando la politica del tenant y la clasificacion de riesgo lo permitan;
- debe seguir dejando trazabilidad completa.

## Clasificacion minima de riesgo

- `read_only`
- `draft_only`
- `write_with_confirmation`
- `auto_executable_low_risk`

## Resultado de ejecucion

Toda ejecucion o intento debe poder clasificarse como:

- `success`
- `failed`
- `blocked`
- `requires_confirmation`

## Reglas no negociables

- la IA no salta politicas del orquestador;
- ninguna herramienta mutante entra a produccion sin certificacion humana;
- ninguna herramienta debe ejecutarse fuera del tenant correspondiente;
- toda herramienta debe ser auditable;
- toda herramienta debe ser versionable;
- toda herramienta debe ser reversible o tener postura explicita de rollback;
- la plataforma debe poder explicar que herramienta propuso o ejecuto y por que.

## Baseline actual vs modelo objetivo

### Baseline actual

- capacidades base del piloto;
- casos, conversaciones, contexto y auditoria;
- modelo de plataforma gobernada;
- documentacion de capacidad y trazabilidad.

### Modelo objetivo

- separacion plena entre intencion, capacidad y herramienta;
- registro gobernado de herramientas;
- politicas de accion por riesgo;
- flujo estandar `suggest -> confirm -> execute`;
- acciones positivas como metrica de negocio y futura unidad de analisis.

## Lo que este documento no afirma como implementado

- runtime completo de herramientas en produccion;
- clasificacion de riesgo ya automatizada;
- certificacion automatizada real;
- monetizacion actual por acciones positivas.
