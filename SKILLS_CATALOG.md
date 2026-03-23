# Skills Disponibles para Llevar a Opita Sync

## Skill ya copiada

- `frontend-browser-qa`
  - utilidad: probar interfaces reales en navegador, revisar consola, red, flujos y regresiones frontend.
  - ruta local en este proyecto: `skills/frontend-browser-qa/SKILL.md`

## Otras skills disponibles en este entorno

- `validate-operational-logic`
  - utilidad: validar documentación, reglas de negocio, arquitectura y especificaciones de capacidades contra los principios no negociables de Opita Sync.

- `frontend-chat-ui`
  - utilidad: construir interfaces modernas de chatbot y workspace conversacional.

- `llm-chat-ui-redesigner`
  - utilidad: rediseñar productos existentes hacia una experiencia chat-first moderna.

- `openai-docs`
  - utilidad: consultar documentacion oficial y actualizada de OpenAI para decisiones de producto o integracion.

- `skill-creator`
  - utilidad: crear nuevas skills o mejorar skills existentes de forma consistente.

- `skill-installer`
  - utilidad: instalar skills desde rutas o repositorios compatibles.

## Recomendacion para Opita Sync

Las mas utiles para llevar despues de `frontend-browser-qa` son:

1. `validate-operational-logic`
   - porque debe funcionar como gate previo para documentación inicial, diseño funcional y capability design.

2. `skill-creator`
   - porque Opita Sync probablemente necesitara skills propias de producto, discovery, capability design y validacion.

3. `frontend-chat-ui`
   - porque el producto tiene un nucleo conversacional y esta skill acelera ese tipo de interfaces.

4. `openai-docs`
   - porque ayuda a investigar decisiones de integracion y patrones de tools/orquestacion con documentacion oficial.

5. `llm-chat-ui-redesigner`
   - util si luego quieren replantear una interfaz existente o prototipo ya construido.

## Criterio para llevar una skill

Solo conviene copiar o instalar skills que aporten a alguno de estos frentes:

- producto conversacional;
- capacidad factory;
- investigacion tecnica;
- validacion frontend real;
- creacion de skills especializadas del producto.
