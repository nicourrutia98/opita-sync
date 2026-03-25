# 24. Phase Backlog

## Immediate backlog by phase

### Phase 1
- define TypeScript types for tenant/environment/user/system identity
- define EffectiveAuthorityArtifact
- define PolicyDecisionArtifact
- define ClassificationScheme and ClassificationMark
- define canonical audit event envelope

### Phase 2
- define ActionAsset and WorkflowAsset schemas
- define AssetPublication schema
- define ExecutionContract and ContractRevision TypeScript models
- define admissibility request envelope

### Phase 3
- define AdmissibilityDecisionArtifact
- define capability selection result
- define ExecutionPlanArtifact
- define compiler guardrails for dynamic composition

### Phase 4
- define Run, RunStep, WaitState, RetryRecord
- define ApprovalCase and approval transitions
- define InboxItem projection model

### Phase 5
- define OutputArtifact
- define MixedAuthorityAnalysis
- define ReleaseDecisionArtifact
- define redaction path contract

### Phase 6
- define API boundary docs for Operate/Catalog/Inbox/Activity/Governance/Settings
- define canonical UI navigation contract
- define state presentation rules for blocked/approval/redacted/released

### Phase 7
- define connector registry schema
- define governed connector invocation request/response contracts
- define connector environment availability model

### Phase 8
- define provider-neutral adapter interfaces
- define provider config model for Settings
- define provider task boundaries allowed in orchestrator

### Phase 9
- define enterprise observability events
- define evidence completeness checklist
- define promotion workflow contracts
