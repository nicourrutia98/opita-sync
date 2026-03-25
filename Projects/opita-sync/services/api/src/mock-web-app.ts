import { createAuditEvent } from '../../../packages/audit/src/index.js';
import { createApprovalCase } from '../../../packages/approvals/src/index.js';
import { createExecutionContract } from '../../../packages/contracts/src/index.js';
import { projectInboxItems } from '../../../packages/inbox/src/index.js';
import type { WebAppViewModel } from './view-models.js';

export function getWebAppViewModel(): WebAppViewModel {
  const contract = createExecutionContract({
    contractId: 'contract_ui_1', revision: 1, tenantId: 'tenant_1', environment: 'dev', initiatorUserId: 'user_1', authorityContextId: 'auth_ctx_1', sourceType: 'chat', objectiveText: 'Prepare a governed customer follow-up draft', requestedOutcome: 'action_execution', successCriteria: ['draft prepared', 'output reviewed'], urgency: 'normal', domainContext: 'operate', includedEntities: ['customer_thread'], excludedEntities: [], allowedDataDomains: ['customer'], excludedDataDomains: [], allowedExternalEffectClass: 'draft_only', dynamicCompositionRequested: false, classificationCeiling: 'confidential', allowedConnectorIds: ['connector_email'], allowedCredentialScopeIds: ['cred_email'], approvalExpectationMode: 'pre-application', draftGenerationAllowed: true, applyAllowed: false, sendAllowed: false, outputSensitivityExpectation: 'governed_output_required', desiredOutputForm: 'draft_message', disclosureAudience: 'initiator', exportRequested: false, sendRequested: false, draftOnly: true, userConstraints: [], systemConstraints: ['intent_normalized_before_execution'], policyConstraints: ['pre_application_approval_for_send'], classificationConstraints: ['mixed_authority_blocks_by_default'], status: 'approval_required'
  });
  const approval = createApprovalCase({ approvalCaseId: 'approval_ui_1', runId: 'run_ui_1', contractId: contract.contractId, contractRevision: contract.revision, mode: 'pre-application', approverIds: ['approver_1'], evidenceRefs: ['contract:contract_ui_1:r1'] });
  const inbox = projectInboxItems({ approvalCase: approval }).map((item: { inboxItemId: string; itemType: string; summary: string }) => ({ itemId: item.inboxItemId, type: item.itemType, summary: item.summary }));
  createAuditEvent({ eventId: 'evt_ui_1', eventType: 'approval.transition', tenantId: 'tenant_1', actorId: 'system', payload: { summary: 'UI seed generated for governed operate screen.', refs: ['approval:approval_ui_1'] } });
  return {
    operate: { objective: contract.objectiveText, contractStatus: contract.status, policyState: 'approval_required', releaseState: 'not_released', warnings: ['Approval required before any final apply/send effect.', 'Mixed-authority output would block by default.'] },
    catalog: [
      { assetId: 'action_customer_followup', name: 'Customer Follow-up', kind: 'action', lifecycleState: 'published', approvalMode: 'pre-application' },
      { assetId: 'workflow_customer_triage', name: 'Customer Triage', kind: 'workflow', lifecycleState: 'published', approvalMode: 'pre-execution' }
    ],
    inbox,
    activity: [
      { runId: 'run_ui_1', state: 'waiting_approval', summary: 'Customer follow-up draft waiting for release approval.' },
      { runId: 'run_ui_0', state: 'released', summary: 'Low-risk internal draft released successfully.' }
    ],
    governance: { activePolicies: ['deny by default', 'most restrictive wins', 'pre-application approval for send'], classificationScheme: 'enterprise-default-v1', publicationControls: ['dev->staging promotion required', 'prod publication locked to superadmin'] },
    settings: {
      activeProviders: ['OpenAI', 'Anthropic', 'Gemini'],
      environments: ['dev', 'staging', 'prod'],
      governedConnectors: ['Email', 'CRM'],
      tenantId: 'tenant_1',
      tenantName: 'Tenant 1',
      defaultEnvironment: 'dev',
      preferredProvider: 'OpenAI',
      connectorNotes: 'High-trust connectors remain centrally governed.'
    }
  };
}
