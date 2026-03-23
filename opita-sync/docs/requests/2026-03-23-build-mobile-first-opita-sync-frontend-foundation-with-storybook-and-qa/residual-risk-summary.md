# Residual Risk Summary

## Remaining Risks

- Remote endpoint contracts are prepared but not yet validated against a live backend; DTO drift is still the main production integration risk.
- The auth contract now assumes `auth/login`, `auth/session`, and password reset endpoints; backend mismatch on those routes or payloads will block remote login.
- The official icon family is partially adopted; a full migration away from temporary utility icons can happen in the next UI batch.
- The proposed app icon is implementation-ready for web and future mobile exports, but it is still a product proposal rather than a formally approved brand asset.
- Dark mode is implemented and validated functionally and visually, but dedicated axe coverage still runs on the baseline theme only.
- Remote mode depends on environment configuration discipline; a bad `VITE_OPITA_API_BASE_URL` will fail fast and rely on fallback only when enabled.
- Password reset is wired as a frontend flow, but email delivery, token issuance, and expiration remain backend responsibilities not exercised in this repo.
- Full integration is now planned by release, but execution risk remains until Release 1 contract gates are validated in staging.
- Release 1 execution board is now defined, but delivery risk remains on cross-team contract sequencing and staging environment readiness.
- External tracker ticketization is now published, but assignment and scheduling in the target tracker remain operational tasks outside this repository.
- Release 2 is integrated in frontend runtime with stub/remote contracts, but remote endpoint parity for new modules (`operational-log`, `capabilities`, `tool-governance`, tenant parameter writes) still requires staging verification.
- Release 3 and Release 4 are integrated in frontend runtime with stub/remote contracts, but remote endpoint parity for new modules (`drafts/generate`, `reporting/value`, `usage/attribution`, `usage/export`, `governance/state`, `governance/action`, `compliance/*`, `navigation/manifest`) still requires staging verification.
- Remote smoke harness exists (`npm run contracts:smoke:remote`), but local evidence is currently `skipped` until staging credentials and base URL are provided.
- Remote smoke harness now has successful synthetic remote evidence; real staging credentials are still required for production-parity confirmation.

## Risk Posture

The frontend is now release-capable as an authenticated shell with controlled fallback behavior and a documented 4-release integration path. Remaining risks are execution-time backend-contract, auth-endpoint, and branding-approval risks rather than blockers for shipping the current package.
