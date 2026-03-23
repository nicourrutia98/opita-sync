---
title: ChatGPT Frontend Pending Brief
status: ready-to-copy
owner: product
last_updated: 2026-03-21
applies_to: frontend-handoff
---

# Frontend Remaining Visual Brief for ChatGPT

Copy everything below this line into ChatGPT.

---

You are helping produce the remaining visual outputs for `Opita Sync`.

## Context

Opita Sync is a governed operational orchestration platform with a `chat-first workspace`.

The product is not a generic chatbot. The interface must center the conversation thread while exposing:
- case state
- guided forms
- role-aware actions
- operational tracking
- tenant-aware settings
- accessibility controls

Supported roles:
- `requester`
- `technician`
- `supervisor`
- `tenant-admin`

Supported platforms:
- `web`
- `iOS`
- `Android`

Accessibility baseline:
- `WCAG 2.2 AA` minimum
- deeper accessibility support for:
  - strong visible focus
  - large touch targets
  - text scaling
  - text spacing tolerance
  - reduced motion
  - screen reader clarity
  - tenant baseline + user override

## Product constraints

- Preserve `chat-first workspace`
- Do not redesign it as a dashboard-first product
- Do not depict it as a generic assistant
- Keep visible distinction between:
  - user messages
  - assistant messages
  - tool messages
  - system messages
- Show operational state, roles, permissions, and traceability cues
- Include settings surfaces for:
  - user accessibility
  - tenant accessibility baseline
  - tenant members/invitations

## Already defined

Main frontend structure:
- left rail: conversations and current cases
- main panel: active thread
- right rail: case context, visible actions, structured form state
- mobile: thread-first with drawers or sheets for secondary/navigation/context

Core flows:
- sign in and tenant resolution
- request creation from natural language to guided form
- status query
- operational logbook update
- draft generation
- tenant accessibility baseline editing
- user accessibility override editing

All non-image decisions are already closed.

Closed defaults:
- product display name: `Opita Sync`
- brand owner display: `Opita Coders`
- short mark: `OS`
- visual direction: `Operational Clarity`
- support contact: `support@opitacoders.com`
- legal footer: `Opita Sync by Opita Coders. Pilot environment.`
- typography base: `Source Sans 3`
- typography mono: `IBM Plex Mono`
- avatar policy: `initials + role badge`
- illustration policy: `none required in v1`
- palette:
  - primary teal: `#0F766E`
  - dark teal: `#115E59`
  - text primary: `#111827`
  - text secondary: `#334155`
  - muted text: `#64748B`
  - border: `#CBD5E1`
  - app background: `#F7F8FA`
  - panel background: `#FFFFFF`
  - success: `#166534`
  - warning: `#A16207`
  - error: `#B91C1C`
  - info: `#1D4ED8`
  - focus: `#0F62FE`

Already accepted:
- primary logo
- monochrome logo variants
- reduced mark
- app icon exports
- favicon exports

Remaining pending outputs are only:
- supervisor workspace visual
- tenant-admin settings and members visual
- user accessibility settings visual
- tenant accessibility baseline visual
- optional illustration files
- optional branded pattern/background files

Safe placeholders allowed:
- initials avatars
- no-illustration empty states
- neutral accessible theme
- placeholder app mark `OS`

## What I need from you

Produce only the pending visual deliverables below. Do not redesign product behavior.

### Deliverable 1. Supervisor workspace visual brief

Define:
- supervisor workspace screen
- visible regions
- critical states
- role boundaries
- accessibility notes

Constraints:
- must preserve chat-first workspace
- must show supervisory visibility without turning into a dashboard

### Deliverable 2. Tenant-admin settings and members visual brief

Define:
- tenant settings view
- members/invitations view
- visible baseline controls
- accessibility baseline management surface

Output:
- screen structure
- component hierarchy
- critical states
- accessibility notes

### Deliverable 3. User accessibility settings visual brief

Define:
- personal accessibility settings screen
- live preview region
- controls for font size, spacing, contrast, motion, labels, and density
- reset-to-tenant-baseline behavior

### Deliverable 4. Tenant accessibility baseline visual brief

Define:
- tenant baseline editor for accessibility
- preview panels
- safe admin controls
- visible separation between tenant baseline and user override

### Deliverable 5. Optional illustration and pattern guidance

Define:
- whether illustrations should exist at all in v1
- if yes, what style they should use
- whether subtle patterns/backgrounds are acceptable
- where they can appear without harming operational clarity

### Deliverable 6. High-quality prompts for UI generation

Write production-grade prompts for generating:
- supervisor workspace
- tenant-admin settings
- tenant-admin members
- user accessibility settings
- tenant accessibility baseline
- optional illustration/pattern set

Need:
- one master prompt
- one prompt per remaining surface

Constraints:
- no vague wording
- no marketing fluff
- keep product logic explicit

### Deliverable 7. Export and handoff package

Provide:
- final handoff checklist for remaining visual generation
- file tree suggestion
- filename convention
- export format guidance
- what can be skipped in v1

### Deliverable 8. Final output format

Return everything in this exact structure:

1. `Supervisor workspace brief`
2. `Tenant-admin settings and members brief`
3. `User accessibility settings brief`
4. `Tenant accessibility baseline brief`
5. `Optional illustration and pattern guidance`
6. `UI generation prompts`
7. `Export and handoff package`
8. `Risks and unresolved items`

## Additional constraints

- Prefer structured lists and tables where helpful
- Be explicit about accessibility impact
- Do not redesign the application or invent new product features
- Keep the output optimized for immediate asset production

---

End of brief.
