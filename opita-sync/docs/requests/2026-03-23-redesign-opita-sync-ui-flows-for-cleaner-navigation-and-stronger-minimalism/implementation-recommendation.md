# Implementation Recommendation

## Decision

Implement the redesign directly in the current React/Vite UI layer, starting with shared surfaces and then simplifying the primary flows in `src/app.tsx`.

## Why This Is The Best Path

- It changes the real product surface immediately.
- It reuses the existing role/view model and data adapters.
- It delivers cleaner UX without requiring architecture churn.

## Immediate Execution Path

1. Rebalance tokens and surface density.
2. Redesign shell and navigation.
3. Simplify inicio, chat, casos, detalle, and configuracion.
4. Validate build and type safety.

## Recommended Next Step After This Task

Refresh visual and a11y evidence for the redesigned surfaces.
