# Política de contexto

## Regla base

Cada skill nueva debe integrarse con `context-core` antes de inventar su propio sistema de memoria.

## Contrato mínimo para futuras skills

Una skill nueva debe poder:

1. leer el manifiesto del proyecto
2. recuperar cards relevantes por tarea
3. escribir decisiones nuevas
4. actualizar estado resumido de la sesión

## Estrategia de ahorro de tokens

- prefijo estable siempre igual cuando sea posible
- recuperación por presupuesto antes de cada prompt
- compacción de sesiones en resúmenes cortos
- eliminación de duplicados semánticos
