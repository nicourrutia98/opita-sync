# Comprobador robusto de fidelidad documental

## Objetivo

Verificar que la documentación generada por el traductor técnico representa fielmente el requerimiento original y está lista para pasar a implementación sin reinterpretación peligrosa.

## Principio

No revises solo calidad literaria ni completitud aparente. Revisa alineación exacta entre:

1. lo que el usuario pidió
2. lo que la traducción técnica interpretó
3. lo que la documentación final afirma
4. lo que un implementador realmente podría construir con ese texto

## Unidad mínima de revisión

Convierte la entrada fuente en unidades trazables. Cada unidad debe contener una sola intención verificable.

Ejemplos:
- `quiero multi-tenant` -> una unidad
- `quiero que sea rápido y seguro` -> dos unidades
- `que funcione con WhatsApp y Telegram pero con panel web primero` -> varias unidades separadas por canal, interfaz y prioridad

## Tipos de falla

### 1. Omisión
El documento no cubre una necesidad explícita o una consecuencia implícita indispensable.

### 2. Invención
El documento introduce capacidades, restricciones, prioridades o decisiones no justificadas por el input.

### 3. Distorsión
El documento conserva términos parecidos, pero cambia el significado operativo.

### 4. Ambigüedad residual
La redacción sigue permitiendo múltiples implementaciones incompatibles.

### 5. No implementabilidad
La idea parece bien explicada, pero un desarrollador no puede construirla ni probarla sin reinterpretar demasiado.

## Procedimiento

1. Congelar la fuente.
2. Extraer unidades trazables.
3. Mapear cobertura.
4. Buscar invenciones.
5. Revisar implementabilidad.
6. Emitir veredicto: `listo_para_desarrollar`, `listo_con_reservas` o `no_listo`.

## Estados de cobertura

- `cubierto`
- `parcialmente_cubierto`
- `no_cubierto`
- `contradicho`
- `inventado`
