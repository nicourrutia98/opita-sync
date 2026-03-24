# Pack óptimo para traducción de proyecto a implementación

## Recomendación

El pack más eficiente para este problema es:

1. `traductor-tecnico` como skill central
2. `precision-gap-closer` como skill complementaria solo para incertidumbre de alto impacto
3. `spec-validator` como MCP pequeño y determinístico para validar estructura, trazabilidad y completitud mínima
4. `doc-fidelity-checker` como capacidad lógica del traductor o como tool adicional del MCP cuando la revisión ya es recurrente

## Regla

No conviertas el razonamiento central en tool MCP si solo va a reempaquetar prompts. El MCP debe aportar una capacidad externa o determinística. Si una parte solo piensa, prioriza o redacta, déjala en la skill.
