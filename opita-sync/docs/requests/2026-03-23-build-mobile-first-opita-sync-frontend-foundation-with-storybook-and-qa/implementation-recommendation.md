# Implementation Recommendation

## Decision

Adopt a web React + Vite + Tailwind + Storybook frontend foundation with open-code primitives compatible with shadcn-style composition.

## Why This Is The Best Path

- It matches the current repo reality better than a universal native/web stack.
- It preserves ownership of the code and avoids paid dependencies.
- It fits Playwright and static deployment through the existing `site/` output model.

## Immediate Execution Path

- Configure frontend tooling.
- Implement visual tokens and primitives.
- Implement priority mobile-first views.
- Add stories and migrate tests.

## Recommended Next Step After This Task

- Replace mock state with typed service adapters as backend contracts emerge.
