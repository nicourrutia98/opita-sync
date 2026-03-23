---
id: tech-role-journeys
title: Role Journeys
status: approved-baseline
owner: product
last_updated: 2026-03-21
applies_to: frontend
related_docs:
  - ./frontend-flow-map.md
  - ./wireflow-spec.md
  - ../01-capabilities/capability-map.md
---

# Role Journeys

## Purpose

Define minimum successful journeys by role.

## `requester`

### Main path

1. sign in
2. land in current workspace
3. enter request in natural language
4. answer clarifying prompts
5. review guided form values
6. submit request
7. receive created case summary
8. return later and ask for status

## `technician`

### Main path

1. sign in
2. open assigned case from rail or query inside thread
3. inspect case state and latest updates
4. append logbook entry
5. optionally generate draft
6. confirm resulting update

## `supervisor`

### Main path

1. sign in
2. open supervised case scope
3. inspect case header, state, and recent logbook
4. ask natural-language status or history questions
5. validate progress and communicate next step

## `tenant-admin`

### Main path

1. sign in
2. open tenant settings
3. invite member
4. review visible permission model
5. update tenant branding baseline
6. update tenant accessibility baseline
7. return to workspace

## Failure journeys

- no membership after successful auth
- pending invitation not yet accepted
- permission denied for visible route
- case exists but role lacks visibility to details
- context incomplete for sensitive action
- offline recovery for drafted but unsent content
