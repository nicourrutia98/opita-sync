# Contrato de salida recomendado

## Vista humana

- resumen_tecnico
- objetivo
- alcance
- no_alcance
- actores
- flujos_principales
- requerimientos_funcionales
- requerimientos_no_funcionales
- arquitectura
- plan_implementacion
- criterios_aceptacion
- matriz_trazabilidad
- reporte_fidelidad
- riesgos
- supuestos
- gaps_abiertos

## Vista estructurada

```json
{
  "project_name": "string",
  "problem_statement": "string",
  "target_users": ["string"],
  "goals": ["string"],
  "non_goals": ["string"],
  "constraints": ["string"],
  "assumptions": [
    {
      "text": "string",
      "impact": "low | medium | high"
    }
  ],
  "functional_requirements": [
    {
      "id": "FR-1",
      "statement": "string",
      "priority": "must | should | could"
    }
  ],
  "non_functional_requirements": [
    {
      "id": "NFR-1",
      "statement": "string",
      "category": "security | performance | reliability | observability | maintainability | cost"
    }
  ],
  "domain_entities": [
    {
      "name": "string",
      "fields": ["string"],
      "states": ["string"]
    }
  ],
  "interfaces": [
    {
      "name": "string",
      "type": "api | event | file | ui | tool",
      "input": "string",
      "output": "string"
    }
  ],
  "architecture": {
    "style": "string",
    "components": ["string"],
    "integrations": ["string"]
  },
  "implementation_plan": [
    {
      "phase": "string",
      "tasks": ["string"],
      "definition_of_done": ["string"]
    }
  ],
  "acceptance_criteria": ["string"]
}
```
