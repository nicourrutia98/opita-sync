# Opita Sync Visual Closure

Paquete final de cierre visual para Opita Sync.

## Contenido
- mockups finales de pantallas faltantes
- revisiones de next screens con drift corregido
- sistema de iconografía `Opita Operational Outline`
- boards de control visual
- specs breves por paquete
- manifest de archivos

## Reglas aplicadas
- teal-first product accent
- blue only for focus / links / utility info
- official Flow Grid v3 mark replaces stable `OS` shell usage
- touch target minimum 44
- admin/settings remain the same product shell
- tenant branding is secondary
- visible accessibility baseline is preserved

## Fuente de verdad usada
- PRODUCT_CONTEXT.md
- docs/00-overview/product-blueprint.md
- docs/02-reference/standard-pilot-spec.md
- docs/02-reference/orchestrator-operating-model.md
- frontend branding closure, tokens, accessibility, iconography, screen inventory, wireflows, role journeys y next screens / Flow Grid specs

## Estructura
- `/screens/*`
- `/revisions/existing-next-screens/*`
- `/boards/*`
- `/icons/svg/{16,20,24,32}/*`
- `/specs/*`
- `manifest.json`

## Nota de actualización
La carpeta `docs2.zip` fue revisada antes del empaquetado final. No introdujo cambios que reabrieran decisiones ya cerradas del sistema visual; el paquete mantiene el baseline aprobado teal-first y el shell con mark oficial.
