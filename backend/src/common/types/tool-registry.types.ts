export interface ToolRegistryRecordInput {
  tenantId: string;
  toolCode: string;
  toolVersion: string;
  capabilityCode: string;
  toolType: string;
  riskLevel:
    | 'READ_ONLY'
    | 'DRAFT_ONLY'
    | 'WRITE_WITH_CONFIRMATION'
    | 'AUTO_EXECUTABLE_LOW_RISK';
  executionMode: 'SUGGEST' | 'CONFIRM_THEN_EXECUTE' | 'AUTO_EXECUTE';
  certificationStatus:
    | 'DRAFT'
    | 'REVIEWED'
    | 'CERTIFIED'
    | 'PRODUCTION'
    | 'DEPRECATED';
  tenantScopeMode: string;
  permissionsRequired: string[];
  requiresProvider?: boolean;
  rollbackStrategy: string;
  inputContractRef: string;
  outputContractRef: string;
}
