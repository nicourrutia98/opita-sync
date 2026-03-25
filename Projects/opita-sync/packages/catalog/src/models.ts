export type AssetLifecycleState = 'draft' | 'review' | 'approved' | 'published' | 'retired';
export type AssetKind = 'action' | 'workflow';
export type ApprovalMode = 'auto' | 'pre-execution' | 'pre-application' | 'double_approval';

export interface AssetPublication {
  publicationId: string;
  assetId: string;
  version: string;
  environment: 'dev' | 'staging' | 'prod';
  publishedAt: string;
  publishedBy: string;
  active: boolean;
}

export interface AssetBase {
  assetId: string;
  assetKind: AssetKind;
  name: string;
  description: string;
  lifecycleState: AssetLifecycleState;
  version: string;
  approvalMode: ApprovalMode;
  classificationTags: string[];
  connectorIds: string[];
  publishedSemanticHash: string;
}

export interface ActionAsset extends AssetBase {
  assetKind: 'action';
  inputContractRef: string;
  outputContractRef: string;
}

export interface WorkflowStep {
  stepId: string;
  actionAssetId: string;
  description: string;
}

export interface WorkflowAsset extends AssetBase {
  assetKind: 'workflow';
  steps: WorkflowStep[];
}

export type CatalogAsset = ActionAsset | WorkflowAsset;

export interface AssetRevisionChangeAssessment {
  assetId: string;
  previousVersion: string;
  nextVersion: string;
  breakingChange: boolean;
  requiresNewAssetIdentity: boolean;
  changedFields: string[];
}
