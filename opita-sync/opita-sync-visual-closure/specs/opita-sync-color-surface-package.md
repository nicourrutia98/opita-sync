# Opita Sync Color and Surface Package

## Propósito
Cerrar el sistema de color y superficies teal-first para workspace, admin y settings.

## Regla de color
- `teal` = acento principal e identitario
- `blue` = foco, links e info utilitaria
- success, warning y error mantienen semántica propia

## Surface system
- `surface.app` para canvas general
- `surface.panel` para paneles, rails, dialogs y forms
- `surface.elevated` para tool cards y nested panels
- bordes suaves y radios 10 / 12 / 16 / 20
- sin glass, glow ni gradients

## Componentes cubiertos
- buttons
- chips
- banners
- rails
- sheets
- dialogs
- forms
- thread messages

## Reglas responsive
- desktop workspace = left rail + main thread + right rail
- mobile workspace = thread-first + bottom sheet
- desktop settings/admin = left nav + main config + impact rail
- mobile settings/admin = task-first + focused editor

## Decisiones críticas
- touch target mínimo = 44
- labels persistentes
- foco visible azul utilitario
- CTA primario teal
- blue no reemplaza la marca
