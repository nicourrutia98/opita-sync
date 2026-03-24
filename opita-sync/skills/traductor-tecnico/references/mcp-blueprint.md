# Blueprint para evolucionar a herramienta MCP

## Objetivo

Convertir la lógica del traductor técnico en una herramienta utilizable por agentes o aplicaciones, sin mover al MCP el razonamiento editorial que sigue siendo mejor dentro de una skill.

## Principio

El MCP debe encargarse de lo determinístico, repetible y conectado a sistemas externos.

## Resources

- taxonomías de arquitectura
- plantillas de spec
- reglas internas de naming
- ejemplos canónicos
- checklists de trazabilidad y fidelidad documental

## Prompts

- arrancar un flujo de traducción técnica
- revisar una especificación existente
- adaptar el spec a skill, API o MCP
- disparar una revisión de fidelidad documental

## Tools mínimas

- `validate_spec`
- `check_doc_fidelity`
- `export_spec`
- `attach_context`

## Transporte

- `stdio` para uso local
- `streamable http` solo cuando haya múltiples clientes
