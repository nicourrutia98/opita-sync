# Compliance Matrix

| ID | Requirement | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| TS-01 | Skill exists with normalized content, references, and agent metadata | `skills/traductor-tecnico/`, `skills/traductor-tecnico/agents/openai.yaml`, packaged zip | Pass | Pack content normalized out of mojibake. |
| TS-02 | `context-core` exists with manifest, policy, and persistent storage | `context-core/manifest.json`, `context-core/CONTEXT-POLICY.md`, `context-core/storage/architecture_decision/spec-hub-bootstrap.json` | Pass | Filesystem-backed storage is active. |
| TS-03 | `mcp/spec-hub/` builds and exposes six tools over `stdio` | `npm run spec-hub:test`, stdio smoke output | Pass | `initialize` and `tools/list` succeeded. |
| TS-04 | Repo-local Codex config includes `spec_hub` | `.codex/config.toml` | Pass | Points to `npm --prefix mcp/spec-hub run start`. |
| TS-05 | Repo exposes build, test, run, and packaging scripts | `package.json` scripts | Pass | Added `spec-hub:*` and `skill:package`. |
| TS-06 | Tests cover validation and fidelity regressions | `mcp/spec-hub/tests/spec-hub.test.ts` | Pass | Includes failing fidelity and corrected export paths. |
