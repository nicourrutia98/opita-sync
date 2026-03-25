# 13. Starter Pack Adaptation Policy

## Purpose

This document states how `opita-page-starter-pack-20260325.zip` is consumed safely.

## Source pack
- `opita-page-starter-pack-20260325.zip`

## Review extraction
- `_starter_pack_review/`

## Accepted as reusable input shapes
- `.storybook/` scaffolding pattern
- `docs/frontend-branding.md`
- `docs/frontend-visual-system.md`
- `src/components/ui/*` as candidate primitives
- `src/components/opita/brand-lockup.tsx`
- `icons/opita-icon-manifest.json`
- `icons/opita-icon-registry.ts`
- `public/brand/*`

## Accepted with required adaptation
- `src/components/opita/app-shell.tsx`
  - must be remapped from current starter navigation to canonical Opita IA
  - must reflect Operate / Catalog / Inbox / Activity / Governance / Settings
  - must surface policy, approval, and blocked states explicitly
- `src/components/opita/auth-shell.tsx`
  - must reflect enterprise identity/SSO/invite semantics, not generic auth UX
- stories
  - may be used as visual references but must be rewritten around governed flows

## Explicit discard conditions
Discard or recreate any asset that:
- implies generic chat-first behavior
- hides governance state
- merges Governance and Settings
- makes blocked/redacted/approval paths look secondary
- assumes simple role-only authorization
- encourages direct tool/action execution from chat

## Canonical frontend alignment rules
- Operate is governed execution workspace
- Catalog is discovery only
- Inbox is actionable queue
- Activity is operational history and audit
- Governance is authority/policy/classification/publication
- Settings is plumbing only

## Implementation rule
The starter pack is never the source of truth.
Product docs and canonical specs outrank it.
