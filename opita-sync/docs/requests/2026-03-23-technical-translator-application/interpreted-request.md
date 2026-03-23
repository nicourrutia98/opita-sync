# Interpreted Request

## Request Summary

Apply the technical-translator workflow from Phase 2 to the current project and use that workflow, without deviation, to develop this very request.

## Primary Objective

Translate the user's natural-language request into closed technical language for this repository, then derive the best implementation path from that normalized artifact instead of improvising directly from raw text.

## Expected User-Visible Behavior

- The current request is processed through interpretation, gap detection, technical normalization, and audit.
- The repo records the request in reusable artifacts instead of handling it only conversationally.
- The project gets a concrete implementation direction rooted in the translator protocol.

## Likely Affected Surfaces

- `docs/requests/<request-id>/interpreted-request.md`
- `docs/requests/<request-id>/gap-matrix.md`
- `docs/requests/<request-id>/technical-language.md`
- `docs/requests/<request-id>/technical-language-audit.md`
- `docs/requests/<request-id>/spec.md`
- `docs/requests/<request-id>/implementation-recommendation.md`

## Immediate Ambiguities

- Whether the user wants only translation artifacts or also the downstream implementation recommendation that follows from a passing audit.

## Suspected Missing Constraints

- No business feature target was named beyond "the current project", so the implementation must stay focused on the workflow/control-plane layer.
- The request forbids drifting away from the Phase 2 translator document, so the method itself is a hard constraint.
