import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const port =
  process.env.PORT ?? String(3101 + Math.floor(Math.random() * 4000));
const baseUrl = `http://127.0.0.1:${port}/api`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mainPath = path.resolve(__dirname, '../dist/src/main.js');

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Server did not become ready at ${url}`);
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return { response, body };
}

async function main() {
  const child = spawn('node', [mainPath], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      PORT: port,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer(`${baseUrl}/health`);

    const { response: healthResponse, body: healthBody } = await jsonRequest(
      '/health',
      { method: 'GET', headers: {} },
    );
    assert.equal(healthResponse.status, 200);
    assert.equal(healthBody.status, 'ok');

    const { response: authResponse, body: authBody } = await jsonRequest(
      '/auth/firebase/exchange',
      {
        method: 'POST',
        body: JSON.stringify({
          firebaseIdToken: 'firebase-admin-token',
        }),
      },
    );
    assert.equal(authResponse.status, 201);
    assert.equal(authBody.role, 'TENANT_ADMIN');
    const adminAccessToken = authBody.accessToken;
    const adminRefreshToken = authBody.refreshToken;

    const { response: tenantResponse, body: tenantBody } = await jsonRequest(
      '/tenants/current',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(tenantResponse.status, 200);
    assert.equal(tenantBody.slug, 'opita-admin');

    const { response: inviteResponse, body: inviteBody } = await jsonRequest(
      '/tenants/current/members/invite',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({
          email: 'member@opitasync.test',
          roleCode: 'REQUESTER',
        }),
      },
    );
    assert.equal(inviteResponse.status, 201);
    assert.ok(inviteBody.inviteToken);

    const { response: blockedMemberResponse } = await jsonRequest(
      '/auth/firebase/exchange',
      {
        method: 'POST',
        body: JSON.stringify({
          firebaseIdToken: 'firebase-member-token',
        }),
      },
    );
    assert.equal(blockedMemberResponse.status, 404);

    const { response: memberAuthResponse, body: memberAuthBody } =
      await jsonRequest('/auth/firebase/exchange', {
        method: 'POST',
        body: JSON.stringify({
          firebaseIdToken: 'firebase-member-token',
          inviteToken: inviteBody.inviteToken,
        }),
      });
    assert.equal(memberAuthResponse.status, 201);
    assert.equal(memberAuthBody.role, 'REQUESTER');
    const memberAccessToken = memberAuthBody.accessToken;

    const { response: settingsResponse, body: settingsBody } = await jsonRequest(
      '/tenants/current/settings',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({
          settingGroup: 'tenant_rules',
          settingKey: 'default_form_template',
          settingValueJson: {
            fields: ['title', 'description'],
          },
        }),
      },
    );
    assert.equal(settingsResponse.status, 200);
    assert.equal(settingsBody.settingKey, 'default_form_template');

    const { response: conversationResponse, body: conversationBody } =
      await jsonRequest('/conversations', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          title: 'Operational request',
        }),
      });
    assert.equal(conversationResponse.status, 201);
    const conversationId = conversationBody.id;

    const { response: messageResponse } = await jsonRequest(
      `/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          senderType: 'USER',
          contentText: 'Necesito abrir una solicitud de mantenimiento',
        }),
      },
    );
    assert.equal(messageResponse.status, 201);

    const { response: summaryResponse } = await jsonRequest(
      `/conversations/${conversationId}/summaries/rebuild`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(summaryResponse.status, 201);

    const { response: caseResponse, body: caseBody } = await jsonRequest(
      '/cases',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          caseType: 'maintenance_request',
          priorityCode: 'normal',
          createdFromConversationId: conversationId,
          initialContextJson: {
            source: 'chat',
          },
        }),
      },
    );
    assert.equal(caseResponse.status, 201);
    const caseId = caseBody.id;

    const { response: updateCaseResponse } = await jsonRequest(`/cases/${caseId}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        statusCode: 'IN_PROGRESS',
      }),
    });
    assert.equal(updateCaseResponse.status, 200);

    const { response: contextResponse, body: contextBody } = await jsonRequest(
      '/context-builder/build',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          conversationId,
          caseId,
          capabilityCode: 'status_query',
          currentUserRequest: 'Quiero saber el estado del caso',
        }),
      },
    );
    assert.equal(contextResponse.status, 201);
    assert.ok(contextBody.productRules.includes('no cross-tenant state mixing'));
    assert.equal(contextBody.caseState.id, caseId);
    assert.equal(contextBody.candidateTools[0].toolCode, 'case_status_reader');

    const { response: toolsResponse, body: toolsBody } = await jsonRequest('/tools', {
      method: 'GET',
      headers: {
          authorization: `Bearer ${adminAccessToken}`,
      },
    });
    assert.equal(toolsResponse.status, 200);
    assert.ok(toolsBody.some((tool) => tool.toolCode === 'case_status_reader'));
    assert.ok(toolsBody.some((tool) => tool.toolCode === 'case_request_writer'));

    const { response: draftToolResponse, body: draftToolBody } = await jsonRequest('/tools', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        toolCode: 'temporary_report_writer',
        toolVersion: 'v1',
        capabilityCode: 'draft_generation',
        toolType: 'report_writer',
        riskLevel: 'DRAFT_ONLY',
        executionMode: 'SUGGEST',
        certificationStatus: 'PRODUCTION',
        tenantScopeMode: 'tenant_parameterized',
        permissionsRequired: ['conversation.write'],
        requiresProvider: false,
        rollbackStrategy: 'not_applicable_draft_only',
        inputContractRef: 'draft_generation.input.v1',
        outputContractRef: 'draft_generation.output.v1',
      }),
    });
    assert.equal(draftToolResponse.status, 201);
    assert.equal(draftToolBody.certificationStatus, 'DRAFT');

    const { response: reviewedToolResponse } = await jsonRequest(
      `/tools/${draftToolBody.id}/review`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(reviewedToolResponse.status, 201);

    const { response: certifiedToolResponse } = await jsonRequest(
      `/tools/${draftToolBody.id}/certify`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(certifiedToolResponse.status, 201);

    const { response: promotedToolResponse } = await jsonRequest(
      `/tools/${draftToolBody.id}/promote`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(promotedToolResponse.status, 201);

    const { response: deprecatedToolResponse, body: deprecatedToolBody } = await jsonRequest(
      `/tools/${draftToolBody.id}/deprecate`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(deprecatedToolResponse.status, 201);
    assert.equal(deprecatedToolBody.certificationStatus, 'DEPRECATED');

    const { response: orchestratorResponse, body: orchestratorBody } = await jsonRequest(
      '/orchestrator/execute',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          conversationId,
          capabilityCode: 'status_query',
          caseId,
          currentUserRequest: 'Quiero saber el estado del caso',
        }),
      },
    );
    assert.equal(orchestratorResponse.status, 201);
    assert.equal(orchestratorBody.toolCode, 'case_status_reader');
    assert.equal(orchestratorBody.executionResult, 'SUCCESS');
    assert.equal(orchestratorBody.payload.caseId, caseId);

    const { response: requestCreateBlockedResponse, body: requestCreateBlockedBody } =
      await jsonRequest('/orchestrator/execute', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          conversationId,
          capabilityCode: 'request_create',
          currentUserRequest: 'Quiero abrir una solicitud nueva',
        }),
      });
    assert.equal(requestCreateBlockedResponse.status, 201);
    assert.equal(requestCreateBlockedBody.executionResult, 'BLOCKED');
    assert.ok(requestCreateBlockedBody.openQuestions.length >= 2);

    const { response: requestConversationResponse, body: requestConversationBody } =
      await jsonRequest('/conversations', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          title: 'New governed request',
        }),
      });
    assert.equal(requestConversationResponse.status, 201);
    const requestConversationId = requestConversationBody.id;

    const { response: requestCreateResponse, body: requestCreateBody } =
      await jsonRequest('/orchestrator/execute', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          conversationId: requestConversationId,
          capabilityCode: 'request_create',
          currentUserRequest: 'Quiero abrir una solicitud nueva',
          caseType: 'maintenance_request',
          priorityCode: 'high',
          structuredFields: {
            assetCode: 'AC-77',
            summary: 'Ruido en el compresor',
          },
        }),
      });
    assert.equal(requestCreateResponse.status, 201);
    assert.equal(requestCreateBody.toolCode, 'case_request_writer');
    assert.equal(requestCreateBody.executionResult, 'REQUIRES_CONFIRMATION');
    assert.ok(requestCreateBody.confirmationId);
    assert.ok(requestCreateBody.confirmationCode);

    const { response: confirmationListResponse, body: confirmationListBody } =
      await jsonRequest('/confirmation-requests', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      });
    assert.equal(confirmationListResponse.status, 200);
    assert.equal(confirmationListBody[0].id, requestCreateBody.confirmationId);

    const { response: confirmExecutionResponse, body: confirmExecutionBody } =
      await jsonRequest(`/orchestrator/confirm/${requestCreateBody.confirmationId}`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${memberAccessToken}`,
        },
        body: JSON.stringify({
          confirmationCode: requestCreateBody.confirmationCode,
        }),
      });
    assert.equal(confirmExecutionResponse.status, 201);
    assert.equal(confirmExecutionBody.executionResult, 'SUCCESS');
    assert.ok(confirmExecutionBody.payload.caseId);
    assert.ok(confirmExecutionBody.payload.caseCode);

    const { response: auditResponse, body: auditBody } = await jsonRequest(
      '/audit-events',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(auditResponse.status, 200);
    assert.ok(auditBody.length >= 8);

    const { response: executionsResponse, body: executionsBody } = await jsonRequest(
      '/tool-executions',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );
    assert.equal(executionsResponse.status, 200);
    assert.equal(executionsBody[0].capabilityCode, 'request_create');
    assert.equal(executionsBody[1].capabilityCode, 'request_create');

    const { response: positiveActionsResponse, body: positiveActionsBody } =
      await jsonRequest('/positive-actions', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      });
    assert.equal(positiveActionsResponse.status, 200);
    assert.equal(positiveActionsBody[0].capabilityCode, 'request_create');
    assert.ok(
      positiveActionsBody.some(
        (action) => action.capabilityCode === 'status_query',
      ),
    );

    const { response: refreshResponse, body: refreshBody } = await jsonRequest(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: adminRefreshToken,
        }),
      },
    );
    assert.equal(refreshResponse.status, 201);
    assert.ok(refreshBody.accessToken);
    assert.ok(refreshBody.refreshToken);

    const { response: logoutResponse, body: logoutBody } = await jsonRequest(
      '/auth/logout',
      {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: refreshBody.refreshToken,
        }),
      },
    );
    assert.equal(logoutResponse.status, 201);
    assert.equal(logoutBody.revoked, true);

    console.log('E2E flow completed successfully.');
  } finally {
    child.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
