import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import type { ProviderAdapter } from '../../packages/provider-adapters/src/index.js';
import { startApiServer } from '../../services/api/src/server.js';

async function post(baseUrl: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function loginForApi(baseUrl: string): Promise<string> {
  const response = await post(baseUrl, '/api/auth/login', {
    email: 'test@test-tenant.local',
    password: 'test123'
  });
  const cookie = response.headers.get('set-cookie');
  assert.equal(response.status, 200);
  assert.ok(cookie);
  return cookie.split(';')[0];
}

async function postAuthed(baseUrl: string, cookie: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      cookie,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

const fakeChatAdapter: ProviderAdapter = {
  providerId: 'openai',
  interpretIntent(request) {
    return { providerId: 'openai', normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
  },
  async *streamChat(request) {
    assert.ok(request.history.length >= 1);
    yield { type: 'started', responseId: 'resp_fake', model: 'gpt-fake', requestId: 'req_fake', continuityMode: 'manual' };
    yield { type: 'delta', delta: 'Governed ' };
    yield {
      type: 'tool_proposals',
      proposals: [
        {
          callId: 'call_fake',
          name: 'propose_governed_action',
          argumentsJson: '{"assetId":"asset_customer_follow_up"}',
          assetId: 'asset_customer_follow_up',
          intentSummary: 'Prepare a customer follow-up',
          rationale: 'Matches the request',
          requiresApproval: true,
          riskNotes: ['approval before release']
        }
      ]
    };
    yield {
      type: 'completed',
      responseId: 'resp_fake',
      model: 'gpt-fake',
      requestId: 'req_fake',
      continuityMode: 'manual',
      text: 'Governed response complete.',
      proposals: [
        {
          callId: 'call_fake',
          name: 'propose_governed_action',
          argumentsJson: '{"assetId":"asset_customer_follow_up"}',
          assetId: 'asset_customer_follow_up',
          intentSummary: 'Prepare a customer follow-up',
          rationale: 'Matches the request',
          requiresApproval: true,
          riskNotes: ['approval before release']
        }
      ]
    };
  }
};

const failingChatAdapter: ProviderAdapter = {
  providerId: 'openai',
  interpretIntent(request) {
    return { providerId: 'openai', normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
  },
  async *streamChat() {
    yield {
      type: 'error',
      code: 'provider_payload_invalid',
      message: 'Provider payload invalid.',
      detail: 'input.1.content.0.type: invalid role/content pairing'
    };
  }
};

function createSequencedChatAdapter(): ProviderAdapter {
  return {
    providerId: 'openai',
    interpretIntent(request) {
      return { providerId: 'openai', normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
    },
    async *streamChat(request) {
      const message = request.history.at(-1)?.content ?? '';
      if (message === 'First') {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      yield { type: 'started', responseId: `resp_${message}`, model: 'gpt-seq', continuityMode: 'manual' };
      yield { type: 'delta', delta: `${message} response` };
      yield {
        type: 'completed',
        responseId: `resp_${message}`,
        model: 'gpt-seq',
        continuityMode: 'manual',
        text: `${message} response`,
        proposals: []
      };
    }
  };
}

function createStoppableChatAdapter(): ProviderAdapter {
  return {
    providerId: 'openai',
    interpretIntent(request) {
      return { providerId: 'openai', normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
    },
    async *streamChat() {
      yield { type: 'started', responseId: 'resp_stop', model: 'gpt-stop', continuityMode: 'manual' };
      yield { type: 'delta', delta: 'Partial response' };
      await new Promise((resolve) => setTimeout(resolve, 180));
      yield { type: 'delta', delta: ' that should never land' };
      yield {
        type: 'completed',
        responseId: 'resp_stop',
        model: 'gpt-stop',
        continuityMode: 'manual',
        text: 'Partial response that should never land',
        proposals: []
      };
    }
  };
}

test('api flow executes governed run and release approval path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath });

  try {
    const cookie = await loginForApi(api.baseUrl);
    const startRes = await postAuthed(api.baseUrl, cookie, '/api/runs/start', {
      rawIntent: 'Prepare a customer follow-up draft',
      approvalMode: 'pre-application'
    });
    assert.equal(startRes.status, 201);
    const startJson = (await startRes.json()) as { runId: string; runState: string; approvalState: string };
    assert.equal(startJson.runState, 'execution_completed');
    assert.equal(startJson.approvalState, 'pending');

    const releaseRes = await postAuthed(api.baseUrl, cookie, `/api/runs/${startJson.runId}/release-check`, {});
    assert.equal(releaseRes.status, 200);
    const releaseJson = (await releaseRes.json()) as { releaseDecision: string; runState: string };
    assert.equal(releaseJson.releaseDecision, 'hold_for_approval');
    assert.equal(releaseJson.runState, 'release_approval_required');

    const approveRes = await postAuthed(api.baseUrl, cookie, `/api/runs/${startJson.runId}/approve-release`, {});
    assert.equal(approveRes.status, 200);
    const approveJson = (await approveRes.json()) as { releaseDecision: string; runState: string };
    assert.equal(approveJson.releaseDecision, 'release');
    assert.equal(approveJson.runState, 'released');

    const detailsRes = await fetch(`${api.baseUrl}/api/runs/${startJson.runId}`, { headers: { cookie } });
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
    const cookie = await loginForApi(api.baseUrl);
    const startRes = await postAuthed(api.baseUrl, cookie, '/api/runs/start', {
      rawIntent: 'Execute governed triage workflow',
      approvalMode: 'pre-execution'
    });
    const startJson = (await startRes.json()) as { runId: string; runState: string; approvalState: string };
    assert.equal(startJson.runState, 'waiting_approval');
    assert.equal(startJson.approvalState, 'pending');

    const approveRes = await postAuthed(api.baseUrl, cookie, `/api/runs/${startJson.runId}/approve-pre-execution`, {});
    assert.equal(approveRes.status, 200);
    const approveJson = (await approveRes.json()) as { runState: string; approvalState: string };
    assert.equal(approveJson.runState, 'execution_completed');
    assert.equal(approveJson.approvalState, 'approved');

    const releaseRes = await postAuthed(api.baseUrl, cookie, `/api/runs/${startJson.runId}/release-check`, {
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

test('api exposes governed chat start, streaming completion and tool proposals', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-chat-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath, chatAdapter: fakeChatAdapter });

  try {
    const cookie = await loginForApi(api.baseUrl);
    const startRes = await postAuthed(api.baseUrl, cookie, '/api/chat/start', {
      message: 'What is the safest governed next step?'
    });
    assert.equal(startRes.status, 201);
    const started = (await startRes.json()) as { chatId: string; status: string };
    assert.equal(started.status, 'queued');

    type ChatDetails = {
      status: string;
      model: string;
      latestAssistantMessage: string;
      latestProposals: Array<{ assetId?: string }>;
    };

    let details: ChatDetails | null = null;

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      const detailsRes = await fetch(`${api.baseUrl}/api/chat/${started.chatId}`, { headers: { cookie } });
      assert.equal(detailsRes.status, 200);
      details = (await detailsRes.json()) as ChatDetails;
      if (details?.status === 'completed') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 75));
    }

    assert.ok(details);
    assert.equal(details.status, 'completed');
    assert.equal(details.model, 'gpt-fake');
    assert.equal(details.latestAssistantMessage, 'Governed response complete.');
    assert.equal(details.latestProposals[0]?.assetId, 'asset_customer_follow_up');
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('api chat preserves canonical context across turns and ignores stale stream updates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-chat-sequence-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath, chatAdapter: createSequencedChatAdapter() });

  try {
    const cookie = await loginForApi(api.baseUrl);
    const firstRes = await postAuthed(api.baseUrl, cookie, '/api/chat/start', { message: 'First' });
    assert.equal(firstRes.status, 201);
    const firstJson = (await firstRes.json()) as { chatId: string };

    await new Promise((resolve) => setTimeout(resolve, 30));

    const secondRes = await postAuthed(api.baseUrl, cookie, '/api/chat/start', {
      chatId: firstJson.chatId,
      message: 'Second'
    });
    assert.equal(secondRes.status, 201);

    type PersistedChat = {
      chatId: string;
      status: string;
      sequenceNumber: number;
      latestAssistantMessage: string;
      providerState?: { continuityMode?: string };
      history: Array<{ role: string; content: string }>;
    };

    let chatRecord: PersistedChat | undefined;
    const deadline = Date.now() + 2500;
    while (Date.now() < deadline) {
      const persisted = JSON.parse(await readFile(statePath, 'utf8')) as { chatRecords: PersistedChat[] };
      chatRecord = persisted.chatRecords.find((record) => record.chatId === firstJson.chatId);
      if (chatRecord?.status === 'completed' && chatRecord.latestAssistantMessage === 'Second response') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    assert.ok(chatRecord);
    assert.equal(chatRecord?.sequenceNumber, 1);
    assert.equal(chatRecord?.latestAssistantMessage, 'Second response');
    assert.equal(chatRecord?.providerState?.continuityMode, 'manual');
    assert.deepEqual(chatRecord?.history.map((entry) => entry.content), ['First', 'Second', 'Second response']);
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('api chat stop cancels streaming while preserving partial assistant text', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-chat-stop-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath, chatAdapter: createStoppableChatAdapter() });

  try {
    const cookie = await loginForApi(api.baseUrl);
    const startRes = await postAuthed(api.baseUrl, cookie, '/api/chat/start', {
      message: 'Stop after the first chunk'
    });
    assert.equal(startRes.status, 201);
    const started = (await startRes.json()) as { chatId: string };

    let sawPartial = false;
    const partialDeadline = Date.now() + 1500;
    while (Date.now() < partialDeadline) {
      const detailsRes = await fetch(`${api.baseUrl}/api/chat/${started.chatId}`, { headers: { cookie } });
      assert.equal(detailsRes.status, 200);
      const details = (await detailsRes.json()) as { latestAssistantMessage: string; status: string };
      if (details.latestAssistantMessage === 'Partial response') {
        sawPartial = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    assert.equal(sawPartial, true);

    const stopRes = await postAuthed(api.baseUrl, cookie, `/api/chat/${started.chatId}/stop`, {});
    assert.equal(stopRes.status, 200);
    const stopped = (await stopRes.json()) as { status: string; latestAssistantMessage: string; interrupted?: boolean; stopReason?: string };
    assert.equal(stopped.status, 'cancelled');
    assert.equal(stopped.latestAssistantMessage, 'Partial response');
    assert.equal(stopped.interrupted, true);
    assert.equal(stopped.stopReason, 'user_stopped');

    await new Promise((resolve) => setTimeout(resolve, 260));

    const persisted = JSON.parse(await readFile(statePath, 'utf8')) as {
      chatRecords: Array<{
        chatId: string;
        status: string;
        latestAssistantMessage: string;
        interrupted?: boolean;
        stopReason?: string;
        history: Array<{ content: string }>;
      }>;
    };
    const chatRecord = persisted.chatRecords.find((record) => record.chatId === started.chatId);

    assert.ok(chatRecord);
    assert.equal(chatRecord?.status, 'cancelled');
    assert.equal(chatRecord?.latestAssistantMessage, 'Partial response');
    assert.equal(chatRecord?.interrupted, true);
    assert.equal(chatRecord?.stopReason, 'user_stopped');
    assert.deepEqual(chatRecord?.history.map((entry) => entry.content), ['Stop after the first chunk', 'Partial response']);
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('api chat preserves typed provider failures for governed UI projection', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-chat-error-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath, chatAdapter: failingChatAdapter });

  try {
    const cookie = await loginForApi(api.baseUrl);
    const startRes = await postAuthed(api.baseUrl, cookie, '/api/chat/start', {
      message: 'Trigger a provider payload failure'
    });
    assert.equal(startRes.status, 201);
    const started = (await startRes.json()) as { chatId: string };

    type ChatDetails = {
      status: string;
      lastError?: string;
      lastErrorCode?: string;
    };

    let details: ChatDetails | null = null;
    const deadline = Date.now() + 1500;
    while (Date.now() < deadline) {
      const detailsRes = await fetch(`${api.baseUrl}/api/chat/${started.chatId}`, { headers: { cookie } });
      assert.equal(detailsRes.status, 200);
      details = (await detailsRes.json()) as ChatDetails;
      if (details?.status === 'failed') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    assert.ok(details);
    assert.equal(details?.status, 'failed');
    assert.equal(details?.lastError, 'Provider payload invalid.');
    assert.equal(details?.lastErrorCode, 'provider_payload_invalid');
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('api projects governed analysis artifacts into operate workspace', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-analysis-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath });

  try {
    const cookie = await loginForApi(api.baseUrl);
    const startRes = await postAuthed(api.baseUrl, cookie, '/api/runs/start', {
      rawIntent: 'Build a governed chart of revenue trend by region'
    });
    assert.equal(startRes.status, 201);
    const startJson = (await startRes.json()) as { runId: string };

    const workspaceRes = await fetch(`${api.baseUrl}/api/operate/workspace?runId=${startJson.runId}`, {
      headers: { cookie }
    });
    assert.equal(workspaceRes.status, 200);
    const workspace = (await workspaceRes.json()) as {
      thread: Array<{ entryId: string; artifacts: Array<{ type: string }> }>;
    };

    const analysisEntry = workspace.thread.find((entry) => entry.entryId === `system:analysis:${startJson.runId}`);
    assert.ok(analysisEntry);
    assert.ok(analysisEntry?.artifacts.some((artifact) => artifact.type === 'dataset_summary'));
    assert.ok(analysisEntry?.artifacts.some((artifact) => artifact.type === 'query_summary'));
    assert.ok(analysisEntry?.artifacts.some((artifact) => artifact.type === 'chart_spec'));
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('api selects governed analysis assets from seeded dataset intents', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-analysis-asset-test-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath });

  try {
    const cookie = await loginForApi(api.baseUrl);

    const summaryStartRes = await postAuthed(api.baseUrl, cookie, '/api/runs/start', {
      rawIntent: 'Summarize the revenue by region dataset'
    });
    assert.equal(summaryStartRes.status, 201);
    const summaryStart = (await summaryStartRes.json()) as { runId: string };
    const summaryRun = (await fetch(`${api.baseUrl}/api/runs/${summaryStart.runId}`, { headers: { cookie } }).then((r) => r.json())) as {
      planSteps: Array<{ assetRef: string }>;
    };
    assert.ok(summaryRun.planSteps.some((step) => step.assetRef === 'action_dataset_summary'));

    const chartStartRes = await postAuthed(api.baseUrl, cookie, '/api/runs/start', {
      rawIntent: 'Build a governed chart of revenue trend by region'
    });
    assert.equal(chartStartRes.status, 201);
    const chartStart = (await chartStartRes.json()) as { runId: string };
    const chartRun = (await fetch(`${api.baseUrl}/api/runs/${chartStart.runId}`, { headers: { cookie } }).then((r) => r.json())) as {
      planSteps: Array<{ assetRef: string }>;
    };
    assert.ok(chartRun.planSteps.some((step) => step.assetRef === 'action_chart_visualization'));
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});
