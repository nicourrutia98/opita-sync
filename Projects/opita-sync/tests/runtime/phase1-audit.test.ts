import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuditEvent } from '../../packages/audit/src/index.js';

test('audit event is immutable and carries evidence payload', () => {
  const event = createAuditEvent({
    eventId: 'evt_1',
    eventType: 'policy.decided',
    tenantId: 'tenant_1',
    actorId: 'user_1',
    payload: {
      summary: 'Denied because restricted data cannot be sent directly.',
      refs: ['policy:deny_restricted_send']
    },
    occurredAt: '2026-01-01T00:00:00.000Z'
  });

  assert.equal(event.payload.summary, 'Denied because restricted data cannot be sent directly.');
  assert.deepEqual(event.payload.refs, ['policy:deny_restricted_send']);
  assert.throws(() => {
    (event as { tenantId: string }).tenantId = 'mutated';
  }, /read only|readonly|Cannot assign/i);
});
