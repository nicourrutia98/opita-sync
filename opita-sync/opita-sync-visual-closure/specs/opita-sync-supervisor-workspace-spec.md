# Opita Sync Supervisor Workspace

## Propósito
Permitir validación, devolución con observación y escalación de casos sin salir del patrón chat-first gobernado.

## Rol / actor
supervisor

## Regiones
- Left rail con cola de validaciones y casos escalados
- Main thread con mensajes de usuario, asistente, herramienta y sistema
- Right rail con estado, próximos pasos, confirmación y límites del rol

## Jerarquía
- Decisión pendiente
- Estado y responsable actual
- Contexto verificado
- Acciones de supervisor

## Componentes clave
- Approval request card
- Trace summary
- Diff / propuesta resumida
- CTA Aprobar y registrar
- CTA Devolver con observación
- CTA Escalar caso

## Estados clave
- Validación requerida
- Bloqueado por política
- Devuelto a técnico
- Escalado
- Aprobado
- Permiso denegado

## Notas desktop
- Left rail 304 px
- Right rail 360 px
- Acciones críticas visibles sin hover

## Notas mobile
- Thread-first
- Bottom sheet para validación y trazabilidad
- Action bar sticky con Aprobar / Devolver / Escalar

## Notas accessibility
- Estado y riesgo con texto + color
- Foco visible en CTAs
- Diff Antes / Después siempre etiquetado
- Touch targets de 44x44

## Decisiones visuales críticas
- Teal como acento de validación y CTA primario
- Blue solo para foco y utilidades
- Mark oficial en shell
- Mismo lenguaje de paneles del workspace technician
