# Opita Sync — Continuación visual del sistema

## Entregables incluidos
- `opita-sync-technician-workspace-desktop.png`
- `opita-sync-mobile-thread-first-board.png`
- `opita-sync-mobile-thread-main.png`
- `opita-sync-mobile-context-sheet.png`

## 1. Technician workspace (desktop)

### Objetivo
Permitir a un `technician` revisar un caso, registrar una actualización operativa, consultar el estado y generar un draft sin romper el patrón chat-first.

### Regiones visibles
- **Left rail**: casos asignados, recientes y límites del rol.
- **Main panel**: hilo activo con mensajes diferenciados entre Usuario, Asistente, Herramienta y Sistema.
- **Right rail**: estado del caso, próximos pasos, contexto verificado, logbook operacional y límites del rol.

### Componentes clave
- Estado visible: `En curso · asignado a ti`
- CTA secundaria: `Consultar estado`
- Card de trazabilidad activa
- Mensaje de herramienta con resultado estructurado
- Mensaje de sistema con acción visible y bloqueo actual
- Banner operacional: `Contexto parcial: falta confirmar responsable interno`
- Campo de nota con foco visible
- CTA `Registrar actualización`
- CTA `Generar draft`

### Estados reflejados
- Caso asignado
- Acción visible por rol técnico
- Bloqueo por contexto faltante
- Trazabilidad activa
- Draft posible pero pendiente de revisión
- Restricciones de rol explícitas

### Notas de accesibilidad
- Foco visible explícito en el campo de actualización y en la acción principal
- Contraste alto en labels, chips y botones
- Labels persistentes en paneles y acciones
- Mensajes tipados con estructura semántica clara
- Targets principales de tamaño amplio
- El color siempre está acompañado por texto

## 2. Mobile thread-first (requester)

### Objetivo
Trasladar el patrón chat-first a móvil sin convertir la experiencia en dashboard. El hilo sigue siendo la vista principal y el contexto secundario aparece en bottom sheet.

### Board incluido
El archivo `opita-sync-mobile-thread-first-board.png` muestra dos estados complementarios:

#### A. Thread principal
- Caso activo en header compacto
- Estado `Esperando información`
- Chips de tenant/contexto operativo
- Hilo con mensajes de Usuario, Asistente, Herramienta y Sistema
- Banner de contexto faltante
- Composer principal fijo con foco visible
- Acceso visible a `Contexto del caso` y `Formulario 2 de 5`

#### B. Contexto en bottom sheet
- Bottom sheet con estado del caso
- Próximos pasos
- Formulario guiado con progreso `2 de 5 completos`
- CTA principal `Continuar formulario`
- Límites del rol requester visibles

### Notas de accesibilidad
- Patrón móvil thread-first sin esconder el hilo
- CTA principal con foco fuerte
- Chips y labels persistentes
- Jerarquía clara entre hilo, sheet y acciones
- Compatible visualmente con reduced motion y text scaling
- El contexto secundario se muestra como sheet, no como dashboard paralelo

## Dirección visual aplicada
- Base neutral clara
- Acento azul contenido
- Bordes suaves
- Sombras mínimas
- Tipografía estilo Inter
- Sin gradientes ni ornamento decorativo
- Producto operacional, no chatbot genérico
