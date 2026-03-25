import type { Environment } from '../../domain/src/index.js';

export interface ConnectorInstance {
  connectorId: string;
  connectorType: string;
  environments: Environment[];
  credentialScopeIds: string[];
  active: boolean;
}

export interface ConnectorInvocationRequest {
  invocationId: string;
  connectorId: string;
  environment: Environment;
  source: 'compiled_runtime_step' | 'freeform';
  runtimeApproved: boolean;
  credentialScopeId: string;
}

export interface ConnectorInvocationReceipt {
  invocationId: string;
  connectorId: string;
  accepted: boolean;
  reason?: string;
}
