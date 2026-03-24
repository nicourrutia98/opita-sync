# Residual Risk Summary

## Remaining Risks

1. Worker-based automated tests are blocked locally by `spawn EPERM`, so runtime validation is lighter than desired.
2. Migration 0003 adds soft archive metadata and must be applied in target environments before archive queries run against fresh schema.
3. The legacy bootstrap route still exists for compatibility, so future changes must avoid reintroducing it as the primary UX path.

## Mitigations

- lint and typecheck passed
- targeted backend compile check passed
- explicit new conversation API is now the primary path in frontend/adapters
