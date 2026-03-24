# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IO-01 | Can the current Codex chat change model in place? | Codex surface | High | If yes, the implementation should target active-thread mutation instead of launch-time routing. | Build mutation flow; reuse launch router | Reuse launch router | Codex | Closed | Only launch-time profile/model selection is supported. | Fixes the architecture. |
| IO-02 | Should the skill create another router or wrap the current one? | Workflow | Medium | A second router would duplicate policy and drift from repo behavior. | New router; wrapper skill | Wrapper skill over current router | Codex | Closed | Extend existing router and create a skill on top. | Lower maintenance. |
| IO-03 | How should “improvement” behave? | Product behavior | Medium | Applying too much improvement would distort scope. | Suggest only; apply one safe improvement; allow many | Apply one safe improvement | User | Closed | One low-risk improvement by default. | Keeps workflow disciplined. |

## Developer Questions for Major Gaps

No open major gaps remain.
