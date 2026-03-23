# Opita Sync Tenant Members

## Propósito
Gestionar miembros, invitaciones, roles y acceso con trazabilidad administrativa.

## Rol / actor
tenant-admin

## Regiones
- Header summary y toolbar
- Tabla o cards de miembros
- Drawer o detail sheet con acciones

## Jerarquía
- Quién tiene acceso
- Rol actual
- Estado de invitación/acceso
- Acciones administrativas

## Componentes clave
- Búsqueda
- Filtros rol/estado
- Member row/card
- Detalle de miembro
- Cambio de rol
- Suspensión / reactivación

## Estados clave
- Activo
- Invitación pendiente
- Invitación expirada
- Suspendido
- Desactivado

## Notas desktop
- Tabla legible con drawer lateral
- Sin bulk actions en v1

## Notas mobile
- Cards apiladas
- Filtros por sheet
- Acciones sensibles con confirmación explícita

## Notas accessibility
- Estados con texto completo
- No depender de tabla comprimida
- Motivo administrativo obligatorio

## Decisiones visuales críticas
- Mismo shell de settings
- Chips semánticos sutiles
- CTA principal teal para invitar
