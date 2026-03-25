import type { ConnectorInstance, ConnectorInvocationReceipt, ConnectorInvocationRequest } from './models.js';

export function assertConnectorInvocationAllowed(request: ConnectorInvocationRequest, connectors: ConnectorInstance[]): ConnectorInvocationReceipt {
  const connector = connectors.find((item) => item.connectorId === request.connectorId);
  if (!connector || !connector.active) return { invocationId: request.invocationId, connectorId: request.connectorId, accepted: false, reason: 'connector_not_active' };
  if (request.source !== 'compiled_runtime_step' || !request.runtimeApproved) return { invocationId: request.invocationId, connectorId: request.connectorId, accepted: false, reason: 'freeform_connector_execution_forbidden' };
  if (!connector.environments.includes(request.environment)) return { invocationId: request.invocationId, connectorId: request.connectorId, accepted: false, reason: 'connector_not_available_in_environment' };
  if (!connector.credentialScopeIds.includes(request.credentialScopeId)) return { invocationId: request.invocationId, connectorId: request.connectorId, accepted: false, reason: 'credential_scope_not_allowed' };
  return { invocationId: request.invocationId, connectorId: request.connectorId, accepted: true };
}
