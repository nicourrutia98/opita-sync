# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | Can a running Codex desktop thread switch its own active model mid-session? | Behavior | High | If yes, the implementation path would target session mutation instead of launch routing. | Investigate official docs, inspect CLI surface, build a session-local command anyway | Use official Codex docs and CLI help as source of truth | Codex | Closed | No supported in-session mutation path was found; routing will happen before new `codex` / `codex exec` launches. | Shapes the whole implementation. |
| G2 | Should the router alter the repo default model automatically? | Scope | Medium | Silent default changes would affect all future sessions, including ones that do not want routing. | Set top-level `profile`, keep opt-in profiles only | Keep current top-level model and add opt-in profiles plus launcher commands. | Codex | Closed | Profiles are added without changing the existing top-level model default. | Minimizes regression risk. |
| G3 | Are skills or MCP the primary abstraction for this feature? | Architecture | Medium | The user explicitly asked to investigate the best form. | MCP server, skill only, launcher script plus skill wrapper | Use launcher script as runtime plane and a repo-local skill as workflow wrapper. | Codex | Closed | Skill wraps the launcher; MCP remains optional for external systems only. | Aligns with product capabilities. |

## Developer Questions for Major Gaps

No open major gaps remain after confirming Codex launch-time configuration behavior from official docs and local CLI help.
