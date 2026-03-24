# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | Where should the implementation live relative to the existing app? | Architecture | High | A parallel workspace would duplicate tooling and fragment request discipline. | Parallel workspace; repo-local integration | Integrate under `repo/opita-sync` | Codex | Closed | Use `skills/`, `mcp/spec-hub/`, and `context-core/` inside the current repo. | Avoids duplicated toolchains. |
| G2 | Which runtime should back `spec-hub`? | Runtime | Medium | A mismatched runtime would add maintenance overhead. | Python; TypeScript | Use TypeScript with repo-local `tsc` and Node ESM | Codex | Closed | Implement `spec-hub` in TypeScript. | Reuses current stack. |
| G3 | How much protocol surface should v1 implement? | MCP scope | Medium | Overbuilding the protocol would delay useful functionality. | Full SDK; minimal protocol surface | Implement `initialize`, `tools/*`, `resources/*`, and `prompts/*` only | Codex | Closed | Build a minimal stdio MCP server with the required surfaces. | Keeps v1 small and usable. |
| G4 | What storage strategy should `context-core` use in v1? | Data | Medium | Storage affects portability and testability. | Vector DB; SQLite; filesystem | Use filesystem JSON/Markdown with manifest and full-text query | Codex | Closed | Filesystem-first storage. | Lower complexity. |

## Developer Questions for Major Gaps

No remaining major gaps. Defaults were fixed during planning.
