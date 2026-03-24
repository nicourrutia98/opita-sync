# Review Checklists

## Checklist general de vistas

### 1. Jerarquía visual
- ¿Hay un heading principal claro y único por superficie?
- ¿Los subtítulos explican el bloque o repiten el heading?
- ¿Las descripciones ayudan a tomar acción o solo ocupan espacio?
- ¿La lectura cae naturalmente de arriba hacia abajo?
- ¿Las acciones primarias y secundarias están separadas con claridad?

### 2. Consistencia de diseño
- ¿Spacing, gaps, márgenes y paddings siguen patrones del repo?
- ¿Radios, bordes y sombras coinciden con shells y cards existentes?
- ¿Los iconos se alinean bien con el texto y sus estados?
- ¿Hay hardcodes que rompen tokens del sistema?
- ¿La vista reusa primitives oficiales antes de inventar estilos nuevos?

### 3. Estados de interfaz
- ¿Existen loading, empty, error y success cuando el flujo lo necesita?
- ¿`disabled` y `loading` se distinguen de forma clara?
- ¿Los estados active/selected comunican foco y selección reales?
- ¿Los errores guían la recuperación?
- ¿Hay feedback al enviar, guardar, filtrar o confirmar?

### 4. Accesibilidad
- ¿El contraste de texto e iconos es suficiente en fondo claro y oscuro?
- ¿El foco visible se mantiene incluso con clases custom?
- ¿Los targets clicables son razonables?
- ¿Los icon-only controls tienen `aria-label` si hace falta?
- ¿La legibilidad se mantiene en densidad alta o paneles secundarios?

### 5. UX funcional
- ¿La UI parece editable solo cuando realmente lo es?
- ¿Inputs, toggles y botones dejan clara su consecuencia?
- ¿Los placeholders ayudan o son texto de relleno?
- ¿Hay mensajes de ayuda donde la acción puede ser ambigua?
- ¿El CTA principal es obvio y el secundario no compite de más?

### 6. Layout y composición
- ¿El espacio vertical está bien distribuido?
- ¿Hay bloques repetidos o redundantes?
- ¿Hay espacios muertos injustificados?
- ¿El scroll afecta la zona correcta y no toda la página?
- ¿Sidebars y paneles secundarios mantienen proporción estable?

### 7. Microcopy
- ¿Los labels son específicos y accionables?
- ¿Los títulos mantienen tono y naming consistentes?
- ¿Hay redundancia entre title/subtitle/helper text?
- ¿Los placeholders y empty states suenan profesionales y naturales?
- ¿Los mensajes de error ayudan a actuar?

### 8. Componentización
- ¿La vista usa `Button`, `Input`, `Textarea`, `Card`, `StateBlock`, etc.?
- ¿Se repiten bloques que deberían ser subcomponentes?
- ¿Hay props visuales hardcodeadas que deberían vivir en un componente base?
- ¿Se respeta la separación entre `src/components/ui` y `src/components/opita`?

### 9. Responsive y robustez
- ¿No hay overflow horizontal?
- ¿Los textos largos truncan o envuelven con dignidad?
- ¿El layout intermedio sigue siendo usable?
- ¿Los paneles no colapsan información crítica?
- ¿El scroll interno sigue estable en desktop y mobile?

## Checklist especial para chat / LLM UI

- composer visible y anclado abajo
- hilo con scroll interno, no scroll de página descontrolado
- mensajes recientes accesibles al cargar
- feedback claro durante streaming o envío
- botón de enviar coherente con `canSend`, `disabled` y `sending`
- placeholders útiles cuando no hay conversación
- sidebar de conversaciones consistente con el panel principal
- indicador de mensajes nuevos visible pero no invasivo
- acciones de cancelar / reintentar / reproducir TTS visibles solo cuando aplican
- estados temporales de IA distinguibles del mensaje final
- evitar recargas de página si el flujo es realtime

## Checklist para dashboard

- heading principal único
- métricas con labels claros y comparables
- densidad visual controlada; no amontonar tarjetas sin jerarquía
- CTA principal visible sin competir con acciones secundarias
- widgets alineados y con alturas razonables
- estados empty/error por bloque cuando una tarjeta depende de data

## Checklist para formularios

- labels arriba o junto al campo de forma consistente
- padding interno correcto en `Input` y `Textarea`
- helper text y validation messages no compiten
- placeholders complementan, no reemplazan, al label
- loading de submit no se ve igual a disabled pasivo
- éxito/error después de guardar es inequívoco

## Checklist para sidebar / panel secundario

- ancho estable y relación clara con el panel principal
- heading y descripción propios si el contenido lo necesita
- scroll independiente cuando la lista crece
- estado activo/seleccionado con contraste suficiente
- iconos y texto alineados en cada item
- vacíos y errores resueltos dentro del panel, no fuera de contexto