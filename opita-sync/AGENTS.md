## Working Method
- Interpret the request before coding.
- Create or update a per-request artifact set under `docs/requests/<request-id>/`.
- Write or update a spec before implementation when behavior or workflow changes.
- Implement in small batches with explicit validation after each batch.

## Gap Policy
- Detect gaps before design or coding.
- Escalate major gaps that affect behavior, scope, acceptance criteria, permissions, or business meaning.
- Resolve only low-risk technical gaps from repo context and record the assumption.

## Implementation Policy
- Do not implement from vague natural language alone.
- Do not make large changes without a batch plan.
- Update docs when behavior, workflow, or decisions change.

## Frontend Policy
- For UI changes, validate content, states, accessibility, responsive behavior, and critical actions.
- Use ui-view-audit when building, redesigning, auditing, or refining views, screens, layouts, dashboards, chat flows, forms, sidebars, or visual components.
- Skip ui-view-audit for backend-only, infrastructure, data-only, or non-visual logic tasks.
- Do not close UI work without evidence for loading, empty, error, and success states when relevant.

## Testing Policy
- Run the cheapest reliable checks first.
- Treat passing tests as evidence, not as the full definition of done.

## Closure Policy
- Finish with a compliance matrix and residual-risk summary.
- Do not claim completion without traceable evidence.
- Keep exactly one active request in `docs/requests/index.md`.
