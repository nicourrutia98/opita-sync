# Opita Sync Iconography Package

## Propósito
Entregar el sistema `Opita Operational Outline` listo para diseño y frontend.

## Familia
- una sola familia outline
- caps y joins redondeados
- lectura clara a 16 px
- sin duotone ni filled mixing

## Tamaños
- 16 = redraw obligatorio
- 20 = compact controls
- 24 = base del sistema
- 32 = headers y resúmenes

## Reglas
- acciones sensibles = icono + texto
- icon-only solo para search / filter / sort / close / chevrons / more
- mismo icono = mismo significado en todo el producto

## Entregables
- board general
- board small-size redraw
- SVG exports 16 / 20 / 24 / 32
- manifest JSON
- registry TS

## Decisiones visuales críticas
- stroke estable
- safe area consistente
- no autoescalar 24 -> 16
- coherencia entre workspace, admin y settings
