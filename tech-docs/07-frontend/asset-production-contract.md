---
id: tech-asset-production-contract
title: Asset Production Contract
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./frontend-decision-baseline.md
  - ./asset-requirements.md
  - ./placeholder-brand-spec.md
---

# Asset Production Contract

## Purpose

Define exactly which binary assets still need to be created and how they should be delivered.

## Required asset packages

### Logo package

- primary logo
- monochrome dark-on-light logo
- monochrome light-on-dark logo
- reduced logo mark
- export formats: `SVG`, `PNG`

### App icon package

- launcher icon master
- iOS app icon export set
- Android adaptive icon source
- export formats: `SVG` master, `PNG` exports

### Favicon package

- favicon 16
- favicon 32
- favicon 48
- web app icon 192
- web app icon 512
- export formats: `PNG`, `ICO`

## Optional packages

- empty-state illustration set
- onboarding illustration set
- branded pattern/background pack
- social/share image

## Naming convention

- `opita-sync-logo-primary.svg`
- `opita-sync-logo-mono-dark.svg`
- `opita-sync-logo-mono-light.svg`
- `opita-sync-mark.svg`
- `opita-sync-app-icon-1024.png`
- `opita-sync-favicon-32.png`

## Delivery rules

- vector masters required for logo and mark
- exported PNG assets must be crisp on high-density screens
- transparent background preferred for logos and icons where applicable
- assets must remain legible against light neutral surfaces

## What can stay placeholder in v1

- no illustrations
- no branded textures or patterns
- initials avatars
- text-based empty states
