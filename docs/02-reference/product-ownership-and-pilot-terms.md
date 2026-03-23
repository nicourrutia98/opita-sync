---
id: reference-product-ownership-and-pilot-terms
title: Product Ownership And Pilot Terms
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: governance
related_docs:
  - ../00-overview/product-blueprint.md
  - ./plans-and-billing.md
  - ./capability-governance.md
---

# Product Ownership And Pilot Terms

## Proposito

Dejar explicita la propiedad del producto y las condiciones base del piloto para evitar confusiones entre personalizacion, implementacion y transferencia de propiedad.

## Audiencia

Producto, comercial, implementacion y cualquier IA que deba explicar los limites del piloto.

## Tipo de documento

Current state.

## Propiedad del producto

- Opita Sync es un producto propio;
- el core del producto, su arquitectura y su catalogo base no se transfieren en el piloto;
- la personalizacion de un tenant no convierte el producto en desarrollo exclusivo del cliente.

## Regla sobre personalizacion

- el tenant se personaliza para la empresa del piloto;
- esa personalizacion ocurre sobre templates base y parametros del producto;
- la personalizacion no autoriza alterar la identidad base del producto ni su gobierno central.

## Regla sobre trabajo adicional

Se considera fuera del alcance base todo requerimiento que implique:

- nueva logica;
- nueva capacidad;
- nueva integracion;
- reglas complejas de datos;
- cambios al modelo base de tenancy, auditoria o billing.

Ese trabajo requiere acuerdo comercial y operativo especifico.

## Regla sobre piloto y escalabilidad

- el piloto busca validar operacion real controlada;
- el piloto no congela decisiones de escalabilidad futura;
- las decisiones de escalado del producto se toman despues del piloto.

## Regla de supervision

- las decisiones y responsabilidades operativas del piloto quedan bajo supervision de Opita Code;
- aprobaciones, despliegues y respuesta frente al cliente no quedan liberadas a terceros en esta fase.
