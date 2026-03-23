---
id: explanation-foundations
title: Foundations
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: platform
related_docs:
  - ../00-overview/product-blueprint.md
  - ../02-reference/standard-pilot-spec.md
  - ../02-reference/capability-governance.md
  - ../02-reference/context-and-memory-management.md
  - ../02-reference/implementation-proposals.md
  - ../06-compliance/data-and-retention-policy.md
---

# Foundations

## Proposito

Explicar los principios no negociables que deben gobernar cualquier documento, decision de arquitectura, especificacion funcional o diseno de capacidad operativa de Opita Sync.

## Audiencia

Producto, arquitectura, implementacion, compliance y agentes de IA que redacten o validen artefactos del producto.

## Tipo de documento

Current state.

## Principio 1. Plataforma gobernada, no chatbot aislado

Opita Sync no se define por una interfaz conversacional sino por una plataforma que interpreta intenciones y activa capacidades operativas bajo reglas, permisos, trazabilidad y control.

Implicaciones:

- no disenar soluciones como bots independientes por area;
- modelar cada accion relevante como capacidad operativa o composicion de capacidades;
- mantener lenguaje y documentacion orientados a gobierno operacional.

## Principio 2. Multitenancy desde el nacimiento del producto

Toda decision funcional o tecnica debe asumir aislamiento por tenant en configuracion, datos, auditoria, billing y politicas.

Implicaciones:

- no introducir flujos que mezclen datos de tenants;
- no redactar especificaciones sin indicar tenant scope;
- no asumir politicas globales cuando deban ser configurables por tenant.

## Principio 3. Parametrizacion como capacidad estructural

El producto debe absorber variaciones razonables entre clientes mediante parametrizacion, no mediante bifurcaciones tempranas del producto.

Implicaciones:

- los campos y reglas configurables deben declararse de forma explicita;
- cada capacidad debe separar comportamiento estandar de comportamiento configurable;
- el desarrollo a medida debe justificarse solo cuando la parametrizacion no sea suficiente;
- en el piloto la parametrizacion es amplia, pero opera dentro de una biblioteca cerrada de templates adaptables;
- si una necesidad requiere nueva logica, nueva capacidad, integracion o reglas complejas de datos, sale de parametrizacion base.

## Principio 4. Trazabilidad exhaustiva por accion

Toda accion operativa relevante debe dejar evidencia suficiente para auditoria, revision y soporte.

Implicaciones:

- registrar actor, tenant, capacidad, timestamp, entidad afectada y resultado;
- capturar before/after state cuando exista mutacion sensible;
- no aprobar una capacidad que ejecute acciones sin eventos de auditoria definidos.

## Principio 5. Cliente aporta el modelo o proveedor de IA

Opita Sync no parte de la premisa de asumir el costo del modelo. El valor del producto esta en la capa de gobierno, orquestacion y automatizacion.

Implicaciones:

- toda arquitectura debe explicitar la frontera entre plataforma, cliente y proveedor del modelo;
- billing y consumo deben poder atribuirse cuando el flujo use modelos de IA;
- no documentar dependencias como si Opita Sync fuera dueno de las cuentas del modelo por defecto;
- el cliente paga el consumo de IA por API;
- los tokens se trazan para soporte, observabilidad y control, no como driver comercial base de la version inicial.

## Principio 5A. El contexto no vive dentro del modelo

Opita Sync no depende de una memoria implicita del proveedor de IA. El contexto operativo por usuario debe ser reconstruido por la plataforma en cada llamada.

Implicaciones:

- toda llamada al modelo debe incluir identidad de tenant, usuario, rol y conversacion;
- el historial no debe enviarse completo en cada request;
- el backend debe persistir historial, resumentes, estado del caso y contexto relevante;
- la recuperacion de contexto debe respetar tenant, permisos y auditoria;
- no debe existir memoria compartida entre tenants o usuarios fuera de reglas explicitas del sistema.

## Principio 6. Compliance colombiano como gate de diseno

La politica de datos y las restricciones legales no son anexos posteriores. Deben aparecer en el diseno de capacidades, flujos y documentos normativos desde el inicio.

Implicaciones:

- identificar datos tratados y sensibilidad;
- declarar base de tratamiento, consentimiento o soporte contractual cuando aplique;
- definir retencion, responsabilidad y evidencia;
- no habilitar reuso de datos para mejora del servicio sin opt-in por tenant;
- excluir datos sensibles de cualquier historial reutilizable;
- limitar el reuso de datos a mejora de plataforma, calidad y orquestacion.

## Principio 7. Producto propio con supervision operativa de Opita Code

Opita Sync es un producto propio. La operacion del piloto y las decisiones relevantes quedan bajo supervision de Opita Code.

Implicaciones:

- la personalizacion por tenant no transfiere propiedad intelectual del core;
- el piloto no convierte el producto en desarrollo exclusivo del cliente;
- aprobacion, despliegue y respuesta operativa frente al cliente quedan bajo supervision de Opita Code.

## Principio 8. AWS con criterio de costo-beneficio real

La arquitectura debe buscar eficiencia de costo sin degradar de forma irresponsable seguridad, auditabilidad o calidad base.

Implicaciones:

- justificar decisiones de infraestructura;
- evitar complejidad excesiva antes de validar el piloto;
- no sacrificar observabilidad o aislamiento por reducir costo.

## Principio 9. Documentacion AI-first

La documentacion debe poder ser leida por humanos y por sistemas de recuperacion semantica sin ambiguedad.

Implicaciones:

- un tema por archivo;
- metadatos consistentes;
- vocabulario canonico;
- separacion clara entre hechos vigentes, decisiones aprobadas, supuestos y roadmap;
- enlaces cruzados explicitos entre artefactos relacionados.

## Criterio de rechazo documental

Un documento debe rechazarse si incurre en alguno de estos fallos:

- trata a Opita Sync como un chatbot generico;
- omite tenant, actores o trazabilidad en un flujo operativo;
- presenta roadmap como si fuera alcance actual;
- no distingue entre regla estandar y parametro por tenant;
- propone reuso de datos sin opt-in y anonimizacion;
- confunde personalizacion de tenant con desarrollo adicional;
- ignora la supervision de Opita Code sobre decisiones y responsabilidades del piloto;
- usa terminos ambiguos que deforman la identidad del producto.
