# 25. Phase Acceptance Gates

## Purpose
Define the acceptance gates that must pass before moving from one implementation phase to the next.

## Gates

### Gate A ? Governance substrate complete
Required before Phase 2 and beyond:
- separated authority surfaces exist
- policy decision artifact exists
- classification model exists
- audit event envelope exists

### Gate B ? Contract and catalog complete
Required before Phase 3 and beyond:
- execution contract revision model exists
- approved asset lifecycle and publication model exists
- no chat-to-execution bypass exists

### Gate C ? Admissibility and plan compilation complete
Required before Phase 4 and beyond:
- admissibility precedes compilation
- approved assets only
- execution plan artifact exists

### Gate D ? Durable runtime and approvals complete
Required before Phase 5 and beyond:
- approvals pause and resume same run identity
- retryable vs terminal failures are explicit
- inbox/action queue semantics exist

### Gate E ? Output control complete
Required before Phase 6 and beyond:
- release decision explicit
- mixed-authority default block
- redaction path governed

### Gate F ? UI alignment complete
Required before broad rollout:
- Operate/Catalog/Inbox/Activity/Governance/Settings aligned to backend semantics
- Governance and Settings remain separate
- approval, blocked, and redaction states visible and actionable

### Gate G ? External integration complete
Required before production connector/provider rollout:
- connectors remain centrally governed
- providers remain subordinate to governance
- e2e tests cover contract -> policy -> compilation -> runtime -> output control
