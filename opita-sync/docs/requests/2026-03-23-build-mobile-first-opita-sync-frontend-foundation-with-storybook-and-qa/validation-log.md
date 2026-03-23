# Validation Log

## Planned Checks

- `npm run lint`
- `npm run typecheck`
- `npm run unit`
- `npm run integration`
- `npm run content`
- `npm run storybook:build`
- `npm run e2e`
- `npm run visual`
- `npm run a11y`
- `npm run contracts:smoke:remote`
- `npm run ci`

## Results

- `npm run lint` -> pass
- `npm run typecheck` -> pass
- `npm run unit` -> pass
- `npm run integration` -> pass
- `npm run content` -> pass
- `npm run build:site` -> pass
- `npm run storybook:build` -> pass
- `npm run e2e` -> pass
- `npm run visual` -> pass
- `npm run a11y` -> pass
- `npm run contracts:smoke:remote` -> pass (skipped locally without staging credentials)
- `npm run contracts:smoke:remote` -> pass (executed against a synthetic remote API with generated credentials and mutation checks enabled)
- `npm run ci` -> pass

## Notes

- `npm run visual` must run sequentially with other Playwright suites because concurrent builds against `site/` can race on public asset copying.
- Planning artifacts for full integration closure are now published and linked:
  - `docs/specs/opita-sync/integration-master-plan.md`
  - `docs/test-plans/opita-sync-integration-and-regression-plan.md`
- Release 1 actionable execution board is now published:
  - `docs/specs/opita-sync/release-1-execution-board.md`
- Release 2 actionable execution board is now published:
  - `docs/specs/opita-sync/release-2-execution-board.md`
- External tracker ticketization exports are now published:
  - `docs/specs/opita-sync/tracker/external-ticketization-guide.md`
  - `docs/specs/opita-sync/tracker/release-1-ticket-export.csv`
  - `docs/specs/opita-sync/tracker/release-2-ticket-export.csv`
- Release 2 runtime integration is now validated in CI with new e2e flows for:
  - governed operational log creation from case detail,
  - capability state change and tenant parameter update from admin configuration,
  - recoverable capability-service failure with retry.
- Release 3 runtime integration is now validated in CI with new e2e flows for:
  - assisted draft generation from chat,
  - value/adoption reporting visibility on home,
  - usage export for external billing from admin configuration.
- Release 4 runtime integration is now validated in CI with new e2e flows for:
  - governance action execution in admin configuration,
  - data-reuse consent update in compliance controls,
  - navigation manifesto visibility in authenticated home by role.
- `npm run contracts:smoke:remote` -> pass (skipped by design in local run due missing `OPITA_SMOKE_*` staging credentials)
- External tracker ticketization package now includes Release 3 and Release 4 exports:
  - `docs/specs/opita-sync/tracker/release-3-ticket-export.csv`
  - `docs/specs/opita-sync/tracker/release-4-ticket-export.csv`
