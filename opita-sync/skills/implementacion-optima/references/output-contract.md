# Output Contract

## Vista humana

- resumen_implementacion
- gaps_resueltos
- mejora_segura_aplicada
- riesgos_residuales
- routing_para_proxima_ejecucion

## Vista estructurada

```json
{
  "implementation_summary": "string",
  "implementation_kind": "small_patch | feature | refactor | architecture | audit | migration | frontend_ui | backend_api",
  "resolved_gaps": [
    {
      "gap": "string",
      "impact": "minor | important | critical",
      "resolution": "string"
    }
  ],
  "safe_improvement_applied": {
    "applied": true,
    "title": "string",
    "why_it_is_safe": "string",
    "expected_value": "string",
    "improvement_size": "small | medium"
  },
  "residual_risks": ["string"],
  "routing_input": {
    "task_type": "coding | review | analysis | architecture | migration | security",
    "risk_level": "low | medium | high",
    "implementation_kind": "small_patch | feature | refactor | architecture | audit | migration | frontend_ui | backend_api",
    "gap_severity": "none | minor | important | critical",
    "gap_count": 0,
    "improvement_mode": "none | suggested | applied_safe_improvement",
    "improvement_size": "none | small | medium"
  }
}
```
