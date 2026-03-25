import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { startApiServer } from '../../services/api/src/server.js';

async function post(baseUrl: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('api flow executes governed run and release approval path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath });

  try {
    const startRes = await post(api.baseUrl, '/api/runs/start', {
      rawIntent: 'Prepare a customer follow-up draft',
      approvalMode: 'pre-application'
    });
    assert.equal(startRes.status, 201);
    const startJson = (await startRes.json()) as { runId: string; runState: string; approvalState: string };
    assert.equal(startJson.runState, 'execution_completed');
    assert.equal(startJson.approvalState, 'pending');

    const releaseRes = await post(api.baseUrl, `/api/runs/${startJson.runId}/release-check`, {});
    assert.equal(releaseRes.status, 200);
    const releaseJson = (await releaseRes.json()) as { releaseDecision: string; runState: string };
    assert.equal(releaseJson.releaseDecision, 'hold_for_approval');
    assert.equal(releaseJson.runState, 'release_approval_required');

    const approveRes = await post(api.baseUrl, `/api/runs/${startJson.runId}/approve-release`, {});
    assert.equal(approveRes.status, 200);
    const approveJson = (await approveRes.json()) as { releaseDecision: string; runState: string };
    assert.equal(approveJson.releaseDecision, 'release');
    assert.equal(approveJson.runState, 'released');

    const detailsRes = await fetch(`${api.baseUrl}/api/runs/${startJson.runId}`);
    const detailsJson = (await detailsRes.json()) as { ok: boolean; record: { run: { state: string }; runtimeEvents: Array<{ eventType: string }> } };
    assert.equal(detailsJson.ok, true);
    assert.equal(detailsJson.record.run.state, 'released');
    assert.ok(detailsJson.record.runtimeEvents.some((event) => event.eventType === 'run.output_review'));
    assert.ok(detailsJson.record.runtimeEvents.some((event) => event.eventType === 'run.release_held'));
    assert.ok(detailsJson.record.runtimeEvents.some((event) => event.eventType === 'run.released'));
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('api flow supports pre-execution approval and mixed-authority block', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath });

  try {
    const startRes = await post(api.baseUrl, '/api/runs/start', {
      rawIntent: 'Execute governed triage workflow',
      approvalMode: 'pre-execution'
    });
    const startJson = (await startRes.json()) as { runId: string; runState: string; approvalState: string };
    assert.equal(startJson.runState, 'waiting_approval');
    assert.equal(startJson.approvalState, 'pending');

    const approveRes = await post(api.baseUrl, `/api/runs/${startJson.runId}/approve-pre-execution`, {});
    assert.equal(approveRes.status, 200);
    const approveJson = (await approveRes.json()) as { runState: string; approvalState: string };
    assert.equal(approveJson.runState, 'execution_completed');
    assert.equal(approveJson.approvalState, 'approved');

    const releaseRes = await post(api.baseUrl, `/api/runs/${startJson.runId}/release-check`, {
      mixedAuthority: true
    });
    const releaseJson = (await releaseRes.json()) as { runState: string; releaseDecision: string };
    assert.equal(releaseJson.releaseDecision, 'block');
    assert.equal(releaseJson.runState, 'release_blocked');
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});
