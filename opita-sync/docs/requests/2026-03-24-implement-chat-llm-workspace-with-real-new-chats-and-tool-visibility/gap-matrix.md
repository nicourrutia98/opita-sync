# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | Existing bootstrap creates or reuses a base thread instead of explicit multi-chat lifecycle | behavior | high | Conflicts with real new chat semantics | keep bootstrap primary / add explicit primitives | add explicit primitives and keep bootstrap only for compatibility | implementation | resolved | explicit `POST /conversations`, `PATCH /conversations/:id`, `POST /conversations/:id/retry-last` | enables real thread lifecycle |
| G2 | Local environment blocks spawned test workers with EPERM | tooling | medium | Standard `tsx --test` and backend test commands fail | stop at typecheck / use alternate non-worker validation | use lint + typecheck + targeted compile checks, and document EPERM runner limitation | validation | accepted | no worker-based test run in this environment | residual validation risk |

## Developer Questions for Major Gaps

No major open product gaps remain for this request.
