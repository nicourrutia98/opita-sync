# Interpreted Request

## Request Summary

Implement the approved chat LLM workspace plan in the real Opita Sync app repo.

## Primary Objective

Turn the current chat into an operational multi-thread workspace with explicit new chat creation, archive-first lifecycle, retry, per-thread drafts, and tool visibility.

## Expected User-Visible Behavior

- users can create a real new chat from sidebar/header
- each new chat inherits the selected case when present
- chats can be renamed and archived
- switching chats preserves draft per thread
- retry and cancel keep the thread coherent
- agent tool activity is visible without exposing chain-of-thought

## Likely Affected Surfaces

- backend conversation endpoints and stream events
- frontend chat workspace, header, sidebar, composer, run status
- remote and stub adapters
- chat-focused tests and request artifacts

## Immediate Ambiguities

- none; product decisions were confirmed before implementation

## Suspected Missing Constraints

- automated runner support may be limited by local EPERM restrictions on spawned test workers
