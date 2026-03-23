---
id: reference-standard-pilot-spec
title: Standard Pilot Spec
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: pilot-baseline
related_docs:
  - ../00-overview/product-blueprint.md
  - ../01-explanation/foundations.md
  - ./plans-and-billing.md
  - ./market-entry.md
  - ./context-and-memory-management.md
  - ../06-compliance/data-and-retention-policy.md
---

# Standard Pilot Spec

## Proposito

Fijar la especificacion base del piloto inicial de Opita Sync para que producto, arquitectura e implementacion trabajen sobre el mismo alcance.

## Audiencia

Producto, arquitectura, implementacion, operaciones y agentes de IA que necesiten referencia concreta del piloto.

## Tipo de documento

Pilot baseline.

## Dominio y objetivo

- dominio inicial: mantenimiento;
- objetivo: demostrar valor operativo real en una empresa con un despliegue controlado y gobernado;
- resultado esperado: reducir friccion en solicitudes, seguimiento y registro operacional, sin perder trazabilidad.

## Paquete operativo inicial

- consulta de datos;
- llenado de formularios burocraticos;
- seguimiento operativo.

## Relacion entre wedge comercial y capacidades base

- `consulta de datos` se implementa principalmente mediante consulta de estado y recuperacion contextual de informacion operativa;
- `llenado de formularios burocraticos` se implementa mediante creacion de solicitudes, captura estructurada y generacion de borradores;
- `seguimiento operativo` se implementa mediante consulta de estado y bitacora operativa;
- el wedge comercial no reemplaza las capacidades base; las agrupa como narrativa de entrada del piloto.

## Actores base

- solicitante: crea solicitudes, consulta estado y recibe respuesta;
- tecnico: consulta solicitudes asignadas, registra avances y completa bitacora;
- supervisor: revisa estados, valida ejecuciones y gestiona excepciones;
- admin tenant: configura parametros del tenant, roles, campos y politicas habilitadas.

## Permisos base

- solicitante: puede crear solicitudes y consultar solo casos autorizados para su contexto;
- tecnico: puede consultar casos asignados y registrar eventos operativos permitidos;
- supervisor: puede consultar, validar, corregir y escalar casos dentro del tenant;
- admin tenant: puede parametrizar el tenant y administrar acceso, pero no omitir trazabilidad ni politicas globales de plataforma.

## Canales y experiencia

- una sola aplicacion React Native para web, iOS y Android;
- experiencia conversacional como punto de entrada principal;
- el mismo backend debe servir a todos los canales con reglas comunes por tenant.

## Regla de contexto por usuario

- el contexto de IA por usuario no se delega al proveedor del modelo como memoria libre;
- cada request al modelo debe reconstruirse con identidad, permisos, estado de caso y contexto relevante;
- la plataforma debe persistir historial, resumentes y referencias operativas por tenant;
- la recuperacion de contexto debe filtrar por tenant, rol y permisos antes de invocar el modelo.

## Personalizacion del tenant

- el tenant se personaliza durante implementacion y despliegue;
- la personalizacion se hace sobre templates base de Opita Sync;
- la personalizacion no autoriza creacion libre de capacidades nuevas en el piloto;
- toda decision relevante del piloto queda bajo supervision de Opita Code.

## Capacidades operativas incluidas

### 1. Creacion de solicitudes

- actor principal: solicitante;
- entrada: solicitud en lenguaje natural o campos estructurados;
- salida: caso registrado con identificador y estado inicial;
- parametros por tenant: tipos de solicitud, campos obligatorios, prioridades, categorias, reglas de asignacion inicial;
- auditoria minima: actor, tenant, contenido estructurado final, timestamp, identificador del caso.

### 2. Consulta de estado

- actor principal: solicitante, tecnico, supervisor;
- entrada: referencia del caso o consulta en lenguaje natural;
- salida: estado actual, responsable y ultima novedad autorizada;
- parametros por tenant: estados visibles por rol, mensajes de respuesta, reglas de privacidad;
- auditoria minima: actor, tenant, consulta realizada, caso consultado y resultado entregado.

### 3. Bitacora operativa

- actor principal: tecnico;
- entrada: avance, comentario, evidencia o actualizacion operativa;
- salida: registro agregado a la trazabilidad del caso;
- parametros por tenant: tipos de registro, campos obligatorios, evidencias permitidas, reglas de validacion;
- auditoria minima: actor, tenant, caso afectado, evento registrado y before/after cuando aplique.

### 4. Generacion de borradores

- actor principal: tecnico o supervisor;
- entrada: contexto del caso y objetivo del borrador;
- salida: texto preliminar para comunicacion, cierre o resumen;
- parametros por tenant: plantillas, tono, formato y aprobaciones requeridas;
- auditoria minima: actor, tenant, caso asociado, plantilla aplicada y consumo atribuible si usa modelo.

## Reglas transversales del piloto

- reglas globales:
  - toda accion operativa debe respetar permisos por rol;
  - toda accion relevante debe producir evento de auditoria;
  - toda capacidad debe ejecutarse dentro del tenant correspondiente;
  - toda variacion entre clientes debe pasar primero por parametrizacion;
  - todo uso de modelo debe mantener frontera explicita con el proveedor aportado por el cliente.
- reglas configurables por tenant:
  - campos obligatorios y opcionales;
  - categorias, prioridades y estados visibles;
  - plantillas, mensajes y aprobaciones requeridas;
  - reglas de acceso adicionales compatibles con el modelo base de roles.
- reglas fuera de parametrizacion estandar:
  - cambios de logica que alteren el modelo base de tenancy, auditoria o billing;
  - integraciones o capacidades nuevas que requieran desarrollo adicional;
  - reglas complejas de datos fuera de los templates base.

## Datos y compliance

- el piloto puede tratar datos operativos e identificables asociados a mantenimiento;
- la base esperada para el tratamiento dentro del piloto es la operacion autorizada por el tenant y su relacion contractual con Opita Sync;
- cada tenant debe definir campos, retencion y reglas de acceso acordes a su operacion;
- Opita Sync debe conservar evidencia de auditoria segun la politica acordada para el piloto y sin perder segregacion por tenant;
- el reuso de datos para mejora del servicio no esta habilitado por defecto;
- si se habilita reuso futuro, debe existir opt-in trazable por tenant y anonimizacion o desidentificacion previa;
- el historial reutilizable debe excluir datos sensibles;
- debe quedar clara la frontera de responsabilidad entre tenant, Opita Sync y proveedor del modelo.

## Medicion y billing

- el piloto debe permitir medicion de actividad por tenant;
- si una capacidad usa tokens o consumo equivalente, el sistema debe poder atribuirlo al tenant;
- el esquema comercial base es piloto + despliegue + mensualidad;
- la mensualidad incluye soporte de Opita Code;
- la mensualidad no incluye consumo de IA del cliente ni desarrollos adicionales fuera de templates base;
- las ejecuciones fallidas no se cobran en la version inicial;
- la trazabilidad de consumo no puede quedar fuera del diseno.

## Trazabilidad minima por llamada al modelo

- tenant_id;
- user_id;
- role;
- conversation_id;
- case_id o entity_id cuando aplique;
- contexto recuperado;
- proveedor o modelo invocado;
- resultado de la llamada;
- capacidad operativa involucrada.

## Fuera de alcance del piloto

- publicacion de capacidades desarrolladas por cliente;
- marketplace de capacidades;
- expansion multiarea fuera del alcance del piloto;
- autonomia completa de administracion por cliente;
- modelo propio de orquestacion entrenado con datos derivados del servicio.

## Riesgos que este documento busca evitar

- convertir el piloto en chatbot sin gobierno;
- crecer por excepciones cliente a cliente sin parametrizacion;
- lanzar flujos sin auditoria suficiente;
- mezclar alcance del piloto con promesas de roadmap.
