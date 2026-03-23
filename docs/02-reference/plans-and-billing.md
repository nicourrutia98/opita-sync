---
id: reference-plans-and-billing
title: Plans And Billing
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: commercial
related_docs:
  - ../00-overview/product-blueprint.md
  - ./standard-pilot-spec.md
  - ./value-framework.md
---

# Plans And Billing

## Proposito

Definir la estructura comercial inicial de Opita Sync, los planes visibles en esta fase y la regla de cobro base para pilotos y despliegues.

## Audiencia

Producto, comercial, implementacion y cualquier IA que deba explicar que se cobra y que no se cobra.

## Tipo de documento

Current state.

## Regla general de cobro

La version inicial de Opita Sync se cobra por:

- piloto;
- despliegue;
- mensualidad.

La mensualidad incluye:

- acceso a la plataforma;
- administracion del tenant;
- gobierno operativo base;
- soporte de Opita Code.

La mensualidad no incluye:

- consumo de IA del cliente;
- desarrollos adicionales;
- automatizaciones complejas de datos;
- personalizaciones fuera de templates base.

## Regla sobre consumo de IA

- el cliente aporta el modelo o API de IA;
- el cliente paga ese consumo directamente;
- Opita Sync debe poder trazar tokens y consumo equivalente por tenant;
- esa trazabilidad existe para soporte, observabilidad y control, no como driver comercial base en v1.

## Regla sobre acciones positivas

- `accion positiva` significa ejecucion tecnica exitosa de una herramienta, sin error, registrada con evidencia suficiente;
- las acciones positivas no reemplazan el baseline comercial actual;
- en esta fase se documentan como metrica estrategica y futura unidad de analisis;
- cualquier evolucion comercial basada en acciones positivas requiere que exista runtime de herramientas, politicas de ejecucion y trazabilidad completa por herramienta.

## Plan Starter

### Incluye

- piloto controlado;
- despliegue inicial;
- tenant configurado;
- usuarios, roles y permisos base;
- paquete operativo inicial;
- parametrizacion sobre templates base;
- trazabilidad por accion;
- soporte de Opita Code en la mensualidad.

### No incluye

- developer plan;
- Capability Studio;
- publicacion directa de capacidades por cliente;
- integraciones profundas;
- automatizaciones complejas de datos fuera de templates base.

## Plan Business

### Incluye

- todo lo del Starter;
- mayor volumen de capacidades operativas;
- templates mas avanzados;
- mayor nivel de parametrizacion por tenant;
- automatizaciones multi paso aprobadas dentro del marco del producto;
- gobierno operacional ampliado.

### No incluye

- publicacion libre de capacidades por cliente;
- cambios que alteren la logica base de tenancy, auditoria o billing;
- desarrollos a medida no aprobados.

## Plan Enterprise

### Incluye

- todo lo del Business;
- despliegue por fases;
- integraciones profundas;
- catalogo ampliado de capacidades;
- acompanamiento operativo mas amplio;
- gobierno y control ampliados segun acuerdo.

### No incluye por defecto

- transferencia de propiedad intelectual del core;
- control de despliegue fuera de supervision de Opita Code;
- consumo de IA absorbido por Opita Sync.

## Roadmap comercial fuera de esta version

- developer plan;
- Capability Studio;
- capacidades subidas por cliente;
- generacion propia de templates por IA.

## Regla de frontera comercial

- si una necesidad se cubre con parametrizacion sobre templates base, entra en el alcance normal de implementacion;
- si requiere nueva logica, nueva capacidad, nueva integracion o reglas complejas de datos, pasa a desarrollo adicional;
- toda excepcion comercial debe documentarse aparte.
