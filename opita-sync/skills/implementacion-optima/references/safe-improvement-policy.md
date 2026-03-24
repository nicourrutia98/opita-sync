# Safe Improvement Policy

## Objetivo

Asegurar que la skill aplique solo mejoras que eleven la calidad de la siguiente implementacion sin desviar el pedido original.

## Reglas

- aplicar como maximo una mejora por ejecucion
- debe ser de bajo riesgo
- debe tener valor visible
- debe quedar etiquetada como mejora aplicada, no como requerimiento original

## Tipos de mejora seguros

- acceptance criteria adicional
- explicitar estados `loading`, `empty`, `error`
- logging o trazabilidad minima
- aclarar rollback o recovery path
- aclarar contrato de entrada/salida
- completar test coverage critica

## Tipos no seguros

- cambio de arquitectura
- cambio de stack
- integracion nueva
- cambio de dominio de negocio
- expansion del alcance funcional

## Verificacion

Antes de aplicar la mejora, responde:

1. cambia el objetivo principal?
2. cambia arquitectura o integraciones?
3. aumenta el riesgo de rollout?
4. sigue siendo razonable en la misma implementacion?

Si cualquier respuesta es si, la mejora no se aplica.
