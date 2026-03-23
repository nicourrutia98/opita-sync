---
id: overview-product-blueprint
title: Product Blueprint
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: platform
related_docs:
  - ../01-explanation/foundations.md
  - ../02-reference/standard-pilot-spec.md
  - ../02-reference/plans-and-billing.md
  - ../02-reference/market-entry.md
  - ../02-reference/orchestrator-operating-model.md
  - ../02-reference/product-ownership-and-pilot-terms.md
  - ../02-reference/context-and-memory-management.md
---

# Product Blueprint

## Proposito

Definir la base ejecutiva de Opita Sync como fuente corta de verdad para contexto de producto, alcance inicial y modelo comercial.

## Audiencia

Gerencia, producto, arquitectura, implementacion inicial y cualquier IA que necesite entender el producto sin leer todo el repositorio.

## Tipo de documento

Current state y pilot baseline.

## Definicion ejecutiva

Opita Sync es una plataforma empresarial de orquestacion operativa por lenguaje natural.

Su funcion no es responder conversaciones aisladas ni comportarse como un asistente generico. Convierte solicitudes en lenguaje natural en acciones gobernadas mediante un orquestador, un catalogo de capacidades operativas, roles, permisos, trazabilidad y control de consumo por tenant.

En su modelo objetivo, Opita Sync opera como una plataforma hibrida de orquestacion con IA donde el cliente adapta sus integraciones al estandar del orquestador, el usuario interactua mediante un chat-orquestador y la plataforma decide si corresponde sugerir, confirmar o ejecutar acciones segun politicas de gobierno.

## Problema que resuelve

Las empresas tienen procesos internos que dependen de mensajes, aprobaciones, consultas y registros dispersos en canales no gobernados. Eso dificulta trazabilidad, tiempos de respuesta, control operativo y reutilizacion de automatizaciones.

Opita Sync busca resolver ese problema exponiendo procesos internos como capacidades operativas gobernadas, invocables por lenguaje natural sobre una misma plataforma.

En esta fase no se fija una tesis definitiva de cliente objetivo ni de escalado. El producto se personaliza por tenant para el piloto y las decisiones escalables se toman despues.

## Diferenciales obligatorios

- gobierno operativo por roles, permisos y supervision;
- capacidades operativas invocables, no solo respuestas conversacionales;
- herramientas estandarizadas y gobernadas bajo un estandar del orquestador;
- separacion explicita entre intencion, capacidad y herramienta;
- parametrizacion amplia por tenant sobre templates base;
- trazabilidad por accion;
- modelo o API de IA aportado por el cliente;
- contexto por usuario y caso reconstruido por la plataforma, no memoria libre del modelo;
- expansion futura por paquetes, capacidades e integraciones.

## Que vende el producto

### Plataforma base

- interfaz conversacional empresarial como punto de entrada;
- orquestacion de solicitudes;
- catalogo de capacidades operativas;
- capa de seleccion y gobierno de herramientas;
- multitenancy;
- parametrizacion por tenant;
- trazabilidad por accion;
- roles y permisos;
- metricas y control de consumo.

### Expansiones

- paquetes de capacidades estandar;
- templates avanzados por dominio;
- automatizaciones multi paso;
- integraciones;
- capacidades personalizadas;
- capacidad futura para publicar capacidades desarrolladas por el cliente bajo gobierno controlado.

## Tesis comercial

Opita Sync cobra por plataforma, gobierno, operacion y automatizacion, no por asumir directamente el costo del modelo de IA.

El cliente aporta el proveedor o API de modelo. Cuando aplique, el consumo de tokens debe poder medirse y atribuirse por tenant para soporte, observabilidad y control, pero no es el eje comercial base de la version inicial.

La narrativa comercial no debe presentarse como consultoria pura ni como software factory de bots. Debe presentarse como plataforma estandar con extensiones controladas y herramientas certificadas bajo gobierno del orquestador.

## Modelo comercial base

- cobro por piloto;
- cobro por despliegue;
- mensualidad por tenant;
- soporte de Opita Code incluido en la mensualidad;
- cobro adicional por capacidades, templates avanzados, integraciones y desarrollos a medida fuera del alcance base.

## Evolucion comercial prevista

- la version actual mantiene `piloto + despliegue + mensualidad`;
- las `acciones positivas` se incorporan como metrica estrategica y futura unidad de analisis;
- una accion positiva se define como una ejecucion tecnica exitosa de herramienta, sin error, registrada con evidencia suficiente;
- esta evolucion no reemplaza el baseline comercial actual hasta que el runtime de herramientas y su gobernanza esten implementados.

## Regla de estandarizacion del producto

- base estandar: plataforma, orquestacion, multitenancy, trazabilidad, roles, permisos y paquete inicial del piloto;
- configurable por tenant: campos, categorias, prioridades, estados visibles por rol, plantillas, parametros de flujo y politicas habilitadas;
- desarrollo a medida: integraciones profundas, nuevas capacidades, nuevas logicas y extensiones aprobadas fuera del paquete estandar.

El objetivo del producto no es abrir automatizaciones libres por tenant. Es exponer capacidades y herramientas bajo un estandar de orquestacion, con gobierno, certificacion y politicas de ejecucion.

## Propiedad y supervision

- Opita Sync es un producto propio;
- la personalizacion por tenant no transfiere el core del producto;
- la supervision de decisiones y responsabilidades del piloto queda bajo Opita Code.

## Alcance inicial aprobado

- dominio inicial: mantenimiento;
- modo inicial: operacion real controlada;
- frontend unico: React Native para web, iOS y Android;
- paquete operativo inicial:
  - consulta de datos;
  - llenado de formularios burocraticos;
  - seguimiento operativo;
  - creacion de solicitudes;
  - consulta de estado;
  - bitacora operativa;
  - generacion de borradores.

## Modelo objetivo de operacion

- el sistema interpreta intenciones del usuario;
- el orquestador resuelve una capacidad operativa;
- la capacidad selecciona una o varias herramientas estandarizadas;
- una politica de accion decide entre `suggest`, `confirm_then_execute` o `auto_execute`;
- toda ejecucion relevante deja evidencia operativa y tecnica.

## Limites del alcance actual

- Capability Studio no forma parte del piloto inicial; queda en roadmap.
- El developer plan no forma parte de la version inicial; queda en roadmap.
- La expansion a otras areas no implica crear bots separados; implica ampliar el catalogo de capacidades operativas sobre la misma plataforma.
- El uso de datos para mejora del servicio no es default; depende de opt-in por tenant y de anonimizacion o desidentificacion previa.
- La mensualidad no incluye consumo de IA del cliente ni desarrollos adicionales fuera de templates base.

## Restricciones no negociables

- multitenancy desde dia 0;
- parametrizacion de campos desde dia 0;
- trazabilidad por accion desde dia 0;
- cumplimiento colombiano como gate de diseno;
- decisiones tecnicas con criterio costo-eficiente en AWS;
- separacion explicita entre alcance actual y roadmap;
- datos anonimizados solo por opt-in y sin datos sensibles;
- toda decision critica del piloto bajo supervision de Opita Code.

## Decisiones ya cerradas en este documento

- Opita Sync se define como plataforma gobernada de capacidades operativas.
- El cliente aporta el modelo o API de IA.
- El cliente paga su propio consumo de IA por API.
- El piloto inicial se centra en mantenimiento.
- El frontend inicial es un producto unico multiplataforma.
- El tenant se personaliza para la empresa del piloto.

## Roadmap relacionado

- Capability Factory para crear, validar, publicar y gobernar capacidades operativas.
- Capability Studio para capacidades desarrolladas por cliente.
- expansion posterior a otras areas sobre la misma plataforma.
- modelo de herramientas certificadas y acciones positivas como unidad de analisis y monetizacion futura.
