# Module 08. Roles, Accesos y Visibilidad

## Purpose

Govern who can see, do, and configure what inside each tenant.

## Scope

- Base roles
- Permission assignment
- Visibility rules by role and entity
- Action restrictions
- Tenant-scoped access control

## Primary Actors

- Solicitante
- Tecnico
- Supervisor
- Admin tenant
- Operador Opita Code

## Key Inputs and Outputs

- Inputs: actor identity, role assignment, tenant scope, requested action, entity context
- Outputs: allow, deny, masked visibility, or escalated governance decision

## Core Flows

1. Resolve actor and tenant scope.
2. Determine entity visibility and action eligibility.
3. Allow or deny access.
4. Record changes to access models.

## Business Rules

- All access is tenant-scoped by default.
- Case and content visibility depend on role and entity rules.
- Tenant admins cannot bypass global policies.
- Opita Code maintains global governance privilege.

## Dependencies

- All functional modules

## Acceptance Focus

- Differentiated permissions by role
- Correct denial of unauthorized actions
- Correct data visibility by role and tenant
- Traceability of access changes

## Open Gaps

- Final detailed permission matrix
