# Package Contract Matrix

| Module | Owns | Must not bypass |
|---|---|---|
| domain | core entities and invariants | governance semantics |
| contracts | execution contract and revisions | direct execution |
| policy-engine | allow/deny/restrict/approval decisions | explainability |
| classification | handling rules and mixed-authority inputs | output governance |
| catalog | governed assets and publication | execution rights |
| authority | effective authority | flat RBAC simplification |
| orchestrator | interpretation + compilation coordination | free agent loop |
| runtime | durable execution | output release |
| approvals | approval state transitions | notification-only model |
| output-control | release decisions | implicit disclosure |
| audit | immutable trace | lossy event history |
| ui-opita | canonical IA and governed UI states | governance/settings merge |
