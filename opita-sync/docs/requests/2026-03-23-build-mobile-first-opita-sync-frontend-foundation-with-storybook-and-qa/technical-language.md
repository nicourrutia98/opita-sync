# Normalized Technical Language

## Original Intent Translation

Create a production-oriented frontend foundation for Opita Sync using free or open source tooling only, with mobile-first layout behavior, actor-based navigation, reusable open-code components, Storybook documentation, and Playwright validation.

## Objective

Establish a maintainable frontend baseline that is implementable now and extensible later, without relying on paid design or UI tooling.

## In Scope

- Frontend repo audit
- Stack choice and justification
- React-based application foundation
- Mobile-first visual system
- Base reusable components
- Storybook configuration and stories
- Priority views aligned to Opita Sync specs
- Playwright validation updates
- Supporting architecture and frontend documentation

## Out of Scope

- Live backend integration
- Native mobile application build
- Paid UI kits or design tools
- Final production content and localization copy deck

## Confirmed Decisions

- The repo target is web-first implementation with mobile-first product behavior, not React Native.
- Storybook is the component source of truth.
- Penpot is not available, so the repo must contain its own visual-system specification.
- The chosen base must remain open-code and accessible.

## Assumptions Accepted by Context

- A React + Vite baseline is the lowest-noise path from current repo state to scalable UI delivery.
- Mobile-first operational flows can be represented credibly with mock data until API contracts exist.
- Admin and governance views may remain web-first even in a mobile-first product.

## Primary Behavior

- The built site presents Opita Sync surfaces rather than the legacy workflow control-plane page.
- The UI exposes role-sensitive navigation, cases, chat, case detail, and governance summaries.
- Base components are reusable and documented.
- Tests verify responsive behavior and key states.

## Alternate and Failure Behavior

- If backend contracts arrive later, replace mock state adapters without rewriting the component system.
- If the product later adds native surfaces, reuse the visual system and interaction model, not the web implementation directly.

## UI/Content Requirements

- Mobile-first layouts with clear primary CTAs
- Compact, operational content
- Explicit empty, loading, error, and success states
- Reusable layout and interaction patterns

## Non-Functional Constraints

- Use only free/open source foundations.
- Keep one active request.
- Keep the component system documented and testable.

## Acceptance Criteria

- The repo contains a chosen frontend stack and supporting docs.
- The repo contains a mobile-first Opita Sync frontend baseline.
- Storybook documents core primitives and priority views.
- Playwright validates the new UI.

## Risks and Unresolved Non-Blockers

- Mock-driven screens will need contract alignment later.
- A future native app will need its own implementation layer.
