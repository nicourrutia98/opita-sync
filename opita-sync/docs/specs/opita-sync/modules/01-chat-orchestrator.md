# Module 01. Chat / Orchestrator

## Purpose

Serve as the main user entry point and translate natural-language requests into governed operational capabilities.

## Scope

- Conversational request intake
- Intent classification
- Missing-context capture
- Suggest, confirm, or execute decisioning
- Contextual response continuity by conversation and case

## Primary Actors

- Solicitante
- Tecnico
- Supervisor
- Admin tenant

## Key Inputs and Outputs

- Inputs: user utterance, tenant identity, role, active case context, recent relevant messages
- Outputs: resolved capability, clarification request, governed action proposal, or audited execution result

## Core Flows

1. Receive request.
2. Resolve tenant, actor, role, and active context.
3. Match request to capability candidate.
4. Determine policy mode and permission posture.
5. Ask for missing data, suggest action, require confirmation, or execute.
6. Persist audit trail and response continuity.

## Business Rules

- Intent alone never authorizes execution.
- Sensitive actions default to non-execution until policy mode permits otherwise.
- Missing mandatory context must trigger clarification or blocking.
- Chat decisions cannot bypass roles, tool governance, or audit.
- Long conversations must collapse into pinned operational summaries, recent-turn windows, and recoverable case checkpoints instead of unbounded history.

## Data and State Concerns

- Conversation state must distinguish freeform chat from case-linked continuity.
- Resolution context must be reconstructible from auditable inputs, not opaque model memory.

## Dependencies

- Module 13. Contexto, Memoria Operativa y Resolucion
- Module 08. Roles, Accesos y Visibilidad
- Module 05. Catalogo de Capacidades
- Module 06. Gobierno de Herramientas
- Module 09. Auditoria y Trazabilidad

## Acceptance Focus

- Distinguishes consultation, action, and follow-up.
- Requests missing data when intent is incomplete.
- Does not auto-execute sensitive actions by default.
- Records all triggered operations in audit.

## Open Gaps

- Implementation detail only: pinned summaries, recent-turn windows, and "resume case" recovery.
