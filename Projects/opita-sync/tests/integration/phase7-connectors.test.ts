import assert from 'node:assert/strict';
import test from 'node:test';

import { assertConnectorInvocationAllowed, type ConnectorInstance } from '../../packages/connectors/src/index.js';

const connector: ConnectorInstance = { connectorId: 'connector_email', connectorType: 'email', environments: ['dev', 'staging'], credentialScopeIds: ['cred_email'], active: true };

test('connector execution must come from compiled runtime step', () => {
  const denied = assertConnectorInvocationAllowed({ invocationId: 'inv_1', connectorId: 'connector_email', environment: 'dev', source: 'freeform', runtimeApproved: false, credentialScopeId: 'cred_email' }, [connector]);
  assert.equal(denied.accepted, false);
  assert.equal(denied.reason, 'freeform_connector_execution_forbidden');
});

test('connector invocation respects environment and credential scope', () => {
  const deniedEnv = assertConnectorInvocationAllowed({ invocationId: 'inv_2', connectorId: 'connector_email', environment: 'prod', source: 'compiled_runtime_step', runtimeApproved: true, credentialScopeId: 'cred_email' }, [connector]);
  assert.equal(deniedEnv.accepted, false);
  const allowed = assertConnectorInvocationAllowed({ invocationId: 'inv_3', connectorId: 'connector_email', environment: 'dev', source: 'compiled_runtime_step', runtimeApproved: true, credentialScopeId: 'cred_email' }, [connector]);
  assert.equal(allowed.accepted, true);
});
