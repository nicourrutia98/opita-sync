---
id: tech-tenant-theme-contract
title: Tenant Theme Contract
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./design-token-spec.md
  - ./accessibility-preference-model.md
---

# Tenant Theme Contract

## Purpose

Constrain tenant branding so customization stays safe and accessible.

## Tenant-customizable fields

- `app_name`
- `logo_url`
- `accent_token`
- `brand_surface_variant`
- `support_contact`
- `legal_footer_text`

## Restricted customization model

- tenants select from approved accent palettes or validated custom accent values
- tenants do not supply arbitrary component-level colors
- typography family stays global in v1
- status colors are not tenant-customizable
- focus ring colors are not tenant-customizable below compliance thresholds
