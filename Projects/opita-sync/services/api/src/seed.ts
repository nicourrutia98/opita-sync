import type { ActionAsset } from '../../../packages/catalog/src/index.js';
import type { PolicySet } from '../../../packages/policy-engine/src/index.js';

export const seedPolicySet: PolicySet = {
  policySetId: 'policy_default_tenant_1',
  version: '1.0.0',
  scope: 'tenant',
  status: 'active',
  rules: [
    {
      ruleId: 'allow_customer_drafts',
      effect: 'allow',
      precedenceWeight: 1,
      conditions: ['domain=customer', 'effect=draft_only'],
      explanationTemplate: 'Customer-domain draft operations are allowed under tenant policy.'
    },
    {
      ruleId: 'require_approval_for_send',
      effect: 'require_approval',
      precedenceWeight: 4,
      conditions: ['effect=external_send'],
      obligations: ['approval:pre_application'],
      explanationTemplate: 'External send requires approval before application.'
    },
    {
      ruleId: 'deny_restricted_send',
      effect: 'deny',
      precedenceWeight: 10,
      conditions: ['classification=restricted', 'action=send'],
      explanationTemplate: 'Restricted-classification send is denied by policy.'
    }
  ]
};

const actionFollowup: ActionAsset = {
  assetId: 'action_customer_followup',
  assetKind: 'action',
  name: 'Customer Follow-up',
  description: 'Prepare a governed customer follow-up draft',
  lifecycleState: 'published',
  version: '1.0.0',
  approvalMode: 'pre-application',
  classificationTags: ['customer'],
  connectorIds: ['connector_email'],
  publishedSemanticHash: 'hash_customer_followup_v1',
  inputContractRef: 'contract:action_customer_followup:input:v1',
  outputContractRef: 'contract:action_customer_followup:output:v1'
};

const actionTriage: ActionAsset = {
  assetId: 'action_customer_triage',
  assetKind: 'action',
  name: 'Customer Triage',
  description: 'Classify and summarize customer ticket threads',
  lifecycleState: 'published',
  version: '1.0.0',
  approvalMode: 'auto',
  classificationTags: ['customer'],
  connectorIds: ['connector_crm'],
  publishedSemanticHash: 'hash_customer_triage_v1',
  inputContractRef: 'contract:action_customer_triage:input:v1',
  outputContractRef: 'contract:action_customer_triage:output:v1'
};

const actionDatasetSummary: ActionAsset = {
  assetId: 'action_dataset_summary',
  assetKind: 'action',
  name: 'Dataset Summary',
  description: 'Inspect and summarize a governed analytical dataset',
  lifecycleState: 'published',
  version: '1.0.0',
  approvalMode: 'auto',
  classificationTags: ['analytics', 'customer'],
  connectorIds: ['connector_analytics'],
  publishedSemanticHash: 'hash_dataset_summary_v1',
  inputContractRef: 'contract:action_dataset_summary:input:v1',
  outputContractRef: 'contract:action_dataset_summary:output:v1'
};

const actionChartVisualization: ActionAsset = {
  assetId: 'action_chart_visualization',
  assetKind: 'action',
  name: 'Chart Visualization',
  description: 'Build a governed chart spec from an allowed dataset',
  lifecycleState: 'published',
  version: '1.0.0',
  approvalMode: 'pre-application',
  classificationTags: ['analytics', 'customer'],
  connectorIds: ['connector_analytics'],
  publishedSemanticHash: 'hash_chart_visualization_v1',
  inputContractRef: 'contract:action_chart_visualization:input:v1',
  outputContractRef: 'contract:action_chart_visualization:output:v1'
};

export const seedCatalog = [actionFollowup, actionTriage, actionDatasetSummary, actionChartVisualization];
