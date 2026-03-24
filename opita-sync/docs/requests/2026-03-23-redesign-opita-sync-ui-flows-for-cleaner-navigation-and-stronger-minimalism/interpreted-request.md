# Interpreted Request

## Request Summary

Redesign Opita Sync UI flows to feel more harmonious, cleaner, and more organized, with stronger minimalism and friendlier navigation.

## Primary Objective

Reduce visual noise and improve continuity across the main user journeys without changing the product's domain logic.

## Expected User-Visible Behavior

- Cleaner shell and navigation
- Stronger visual hierarchy
- Less simultaneous panel noise
- More progressive disclosure for secondary context
- More readable operational and backoffice flows

## Likely Affected Surfaces

- `src/app.tsx`
- `src/components/opita/*`
- `src/components/ui/*`
- `src/index.css`
- request and UX documentation

## Immediate Ambiguities

- None that block implementation. The repo already defines core roles, views, and visual system inputs.

## Suspected Missing Constraints

- The redesign should preserve current data contracts and functional states.
