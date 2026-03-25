export interface NormalizeIntentInput {
  tenantId: string;
  environment: 'dev' | 'staging' | 'prod';
  initiatorUserId: string;
  authorityContextId: string;
  sourceType: 'chat' | 'catalog_launch' | 'automation_event';
  rawIntent: string;
  requestedActionAssetId?: string;
  requestedWorkflowAssetId?: string;
}

export interface NormalizeIntentOutput {
  objectiveText: string;
  requestedOutcome: string;
  successCriteria: string[];
  domainContext: string;
}
