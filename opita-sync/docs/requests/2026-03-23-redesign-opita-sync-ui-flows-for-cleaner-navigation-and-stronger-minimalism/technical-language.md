# Normalized Technical Language

## Original Intent Translation

Redesign the Opita Sync interface so navigation and flow continuity feel calmer, more direct, and less visually noisy, while preserving the app's operational and governance behavior.

## Objective

Create a stronger minimal, role-aware UI with cleaner hierarchy, fewer competing panels, and progressive disclosure for secondary context.

## In Scope

- shell and navigation hierarchy
- operational home
- chat/orchestrator
- cases queue
- case detail
- configuration/backoffice
- shared visual primitives and tokens

## Out of Scope

- backend contract changes
- business logic redesign
- new modules

## Confirmed Decisions

- strong minimalism
- redesign across all main flows
- reopened visual direction in a controlled way

## Assumptions Accepted by Context

- case detail remains the continuity anchor surface
- critical states remain mandatory even if the default presentation becomes cleaner

## Primary Behavior

- reduce visible visual density
- keep a single dominant action per surface
- move secondary context behind disclosure where possible
- clarify navigation and action hierarchy by role

## Alternate and Failure Behavior

- if a flow needs dense detail for trust, it stays available through secondary panels or disclosure blocks
- redesign must not hide critical blocked/error/audit outcomes

## UI/Content Requirements

- cleaner shell
- less promotional header language
- calmer surfaces
- lower badge and border noise
- clearer reading rhythm

## Non-Functional Constraints

- preserve current functional states
- keep mobile-first for operational roles
- keep web-first layouts for backoffice roles where appropriate

## Acceptance Criteria

1. Shell and navigation hierarchy are visibly simplified.
2. Inicio, chat, casos, detalle, and configuracion use cleaner information grouping.
3. Shared primitives support the calmer visual system.
4. The site still builds and typechecks.
5. Request artifacts and validation logs are updated.

## Risks and Unresolved Non-Blockers

- Some secondary context may now require one extra interaction to reveal.
