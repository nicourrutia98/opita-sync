---
id: compliance-data-and-retention-policy
title: Data And Retention Policy
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: compliance
related_docs:
  - ../02-reference/standard-pilot-spec.md
  - ../02-reference/product-ownership-and-pilot-terms.md
  - ../02-reference/capability-governance.md
---

# Data And Retention Policy

## Proposito

Definir la postura base de Opita Sync sobre retencion, auditoria y uso de datos derivados en la fase inicial.

## Audiencia

Producto, compliance, implementacion y cualquier IA que necesite aplicar reglas de datos al piloto.

## Tipo de documento

Current state.

## Regla base de retencion

- Opita Sync define una politica base de retencion;
- cada tenant puede ajustarla dentro de limites acordados;
- la politica aplicada debe preservar segregacion por tenant y evidencia suficiente para soporte y auditoria.

## Auditoria minima obligatoria

Toda accion operativa relevante debe registrar:

- actor;
- tenant;
- capacidad;
- timestamp;
- entidad afectada;
- resultado;
- before/after cuando exista mutacion.

## Regla sobre historial de chats

- Opita Sync puede recolectar historial de chats solo si existe opt-in del tenant;
- cualquier historial reutilizable debe anonimizarse o desidentificarse antes de reutilizacion;
- el historial reutilizable debe excluir datos sensibles.

## Regla sobre memoria operativa

- el historial operativo persistido para reconstruir contexto no equivale automaticamente a dataset de mejora;
- una cosa es memoria del producto para operar el caso y otra cosa es reutilizacion de datos para mejorar la plataforma;
- la memoria operativa debe seguir reglas de tenant, permisos, retencion y auditoria aunque no exista opt-in de mejora;
- el uso de historiales para mejora solo se permite bajo el opt-in descrito en este documento.

## Limite de reutilizacion de datos

- los datos derivados solo pueden usarse para mejora de plataforma, calidad y orquestacion;
- no pueden usarse para otros fines comerciales;
- no deben mezclarse tenants sin control y segregacion explicita.

## Frontera de responsabilidad

- el tenant conserva su responsabilidad sobre sus datos y politicas internas;
- Opita Sync aplica gobierno, trazabilidad y retencion dentro del servicio;
- el proveedor del modelo queda separado como tercero aportado por el cliente cuando aplique.

## Roles operativos de tratamiento en el piloto

- el tenant actua como responsable primario de los datos de su operacion y define reglas internas, accesos y ajustes permitidos;
- Opita Sync actua como operador de la plataforma y encargado operativo del procesamiento necesario para orquestacion, trazabilidad, retencion y soporte del servicio;
- el proveedor del modelo actua como tercero separado dentro de la cadena tecnica cuando el tenant decide usarlo;
- cualquier reutilizacion para mejora de plataforma requiere el opt-in del tenant y no cambia esta separacion base de responsabilidades.
