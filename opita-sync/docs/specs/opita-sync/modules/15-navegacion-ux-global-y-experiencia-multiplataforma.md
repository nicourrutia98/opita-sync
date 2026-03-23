# Module 15. Navegacion, UX global y experiencia multiplataforma

## Purpose

Provide a coherent experience across web, iOS, and Android with chat as the main entry and structured modules as operational support.

## Scope

- Global navigation
- Home
- Chat
- Cases
- Backoffice
- Audit
- Reporting
- Administration
- Loading, empty, error, and success states
- Responsive behavior

## Primary Actors

- All user-facing roles

## Key Inputs and Outputs

- Inputs: role, active task, device class, tenant configuration
- Outputs: role-appropriate navigation, continuity between chat and structured modules, validated UX states

## Core Flows

1. Enter through home or deep-linked module.
2. Expose role-scoped navigation.
3. Move between chat, case views, audit, reporting, and admin surfaces without losing operational continuity.

## Business Rules

- There must be one coherent product, not disconnected surfaces.
- Chat cannot be the only surface when operation and governance require structure.
- Navigation must reflect role differences.
- Operational roles must complete primary flows from mobile first; admin and governance roles may rely on web-first surfaces.

## Dependencies

- All user-visible modules

## Acceptance Focus

- Clear navigation by role
- Consistent access to chat, cases, and structured views
- Continuity between consultation, action, and follow-up
- Full UX states for critical flows

## Open Gaps

- Detailed screen choreography only. Platform priority is fixed to mobile-first for operational roles.
