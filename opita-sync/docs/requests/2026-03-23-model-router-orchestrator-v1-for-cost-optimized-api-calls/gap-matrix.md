# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G-01 | Organization usage/cost API verification requires admin credentials not guaranteed in all environments. | Permissions | medium | Without credentials, direct external cost reconciliation cannot run automatically. | Block implementation, make feature optional | Implement optional reconciliation path gated by env vars and keep core benchmark deterministic and local-first. | agent | resolved | Optional admin-cost reconciliation with explicit skip behavior when credentials are absent. | No blocker for V1 |
| G-02 | No prior serving layer exists in repo. | Scope | low | Endpoint placement and conventions are not predefined. | Add framework dependency, use Node standard library | Use Node standard library (`http`, `fetch`) to keep stack minimal. | agent | resolved | Service implemented with native Node APIs. | Lower complexity |

## Developer Questions for Major Gaps

No remaining major gaps block implementation.
