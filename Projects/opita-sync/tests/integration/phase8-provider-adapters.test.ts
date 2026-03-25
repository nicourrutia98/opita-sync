import assert from 'node:assert/strict';
import test from 'node:test';

import { anthropicAdapter, createOpenAIAdapter, geminiAdapter, openaiAdapter } from '../../packages/provider-adapters/src/index.js';

test('provider adapters are neutral and only normalize intent', () => {
  const adapters = [openaiAdapter, anthropicAdapter, geminiAdapter];
  const results = adapters.map((adapter) => adapter.interpretIntent({ rawIntent: '  governed request  ' }));
  assert.deepEqual(results.map((item) => item.normalizedIntent), ['governed request', 'governed request', 'governed request']);
  assert.deepEqual(results.map((item) => item.providerId), ['openai', 'anthropic', 'gemini']);
});

test('openai adapter streams text and governed proposals from Responses API events', async () => {
  const adapter = createOpenAIAdapter({
    model: 'gpt-test',
    client: {
      responses: {
        create() {
          return {
            async *[Symbol.asyncIterator]() {
              yield { type: 'response.created', response: { id: 'resp_1', model: 'gpt-test' } };
              yield { type: 'response.output_text.delta', delta: 'Plan ' };
              yield {
                type: 'response.output_item.done',
                item: {
                  type: 'function_call',
                  call_id: 'call_1',
                  name: 'propose_governed_action',
                  arguments: JSON.stringify({
                    assetId: 'asset_follow_up',
                    intentSummary: 'Prepare a follow-up',
                    rationale: 'Matches the customer draft workflow',
                    requiresApproval: true,
                    riskNotes: ['human approval before send']
                  })
                }
              };
              yield {
                type: 'response.completed',
                response: {
                  id: 'resp_1',
                  model: 'gpt-test',
                  output: [
                    {
                      type: 'message',
                      content: [{ type: 'output_text', text: 'Plan next governed step.' }]
                    }
                  ]
                }
              };
            }
          };
        }
      }
    }
  });

  const events = [];
  for await (const event of adapter.streamChat({
    history: [{ role: 'user', content: 'Help with next step' }],
    governedInstructions: 'Governed instructions',
    assets: [
      {
        assetId: 'asset_follow_up',
        name: 'Follow Up',
        description: 'Draft a follow-up',
        approvalMode: 'pre-application',
        connectorIds: ['connector_email']
      }
    ]
  })) {
    events.push(event);
  }

  assert.ok(events.some((event) => event.type === 'started'));
  assert.ok(events.some((event) => event.type === 'delta' && event.delta === 'Plan '));
  const proposalEvent = events.find((event) => event.type === 'tool_proposals');
  assert.equal(proposalEvent?.type, 'tool_proposals');
  assert.equal(proposalEvent?.proposals[0]?.assetId, 'asset_follow_up');
  const completedEvent = events.find((event) => event.type === 'completed');
  assert.equal(completedEvent?.type, 'completed');
  assert.equal(completedEvent?.text, 'Plan ');
  assert.equal(completedEvent?.proposals[0]?.requiresApproval, true);
  assert.equal(completedEvent?.continuityMode, 'manual');
});

test('openai adapter falls back to manual history when provider continuity is unavailable', async () => {
  let callCount = 0;
  const adapter = createOpenAIAdapter({
    model: 'gpt-test',
    client: {
      responses: {
        create(request) {
          callCount += 1;
          const payload = request as { previous_response_id?: string };

          return {
            async *[Symbol.asyncIterator]() {
              if (callCount === 1 && payload.previous_response_id) {
                throw new Error(`400 Previous response with id '${payload.previous_response_id}' not found.`);
              }
              yield { type: 'response.created', response: { id: 'resp_2', model: 'gpt-test' } };
              yield { type: 'response.output_text.delta', delta: 'Recovered ' };
              yield {
                type: 'response.completed',
                response: {
                  id: 'resp_2',
                  model: 'gpt-test',
                  output: [
                    {
                      type: 'message',
                      content: [{ type: 'output_text', text: 'Recovered response.' }]
                    }
                  ]
                }
              };
            }
          };
        }
      }
    }
  });

  const events = [];
  for await (const event of adapter.streamChat({
    history: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
      { role: 'user', content: 'Continue' }
    ],
    governedInstructions: 'Governed instructions',
    providerStateHint: {
      lastResponseId: 'resp_missing',
      canResumeProviderState: true
    },
    assets: []
  })) {
    events.push(event);
  }

  assert.equal(callCount, 2);
  const completedEvent = events.find((event) => event.type === 'completed');
  assert.equal(completedEvent?.type, 'completed');
  assert.equal(completedEvent?.continuityMode, 'fallback_manual');
  assert.match(completedEvent?.recoverableError ?? '', /Previous response with id/);
});

test('openai adapter serializes assistant history as output_text for Responses API input', async () => {
  let capturedInput: unknown;
  const adapter = createOpenAIAdapter({
    model: 'gpt-test',
    client: {
      responses: {
        create(request) {
          capturedInput = (request as { input?: unknown }).input;
          return {
            async *[Symbol.asyncIterator]() {
              yield { type: 'response.created', response: { id: 'resp_hist', model: 'gpt-test' } };
              yield {
                type: 'response.completed',
                response: {
                  id: 'resp_hist',
                  model: 'gpt-test',
                  output: [{ type: 'message', content: [{ type: 'output_text', text: 'Done.' }] }]
                }
              };
            }
          };
        }
      }
    }
  });

  for await (const _event of adapter.streamChat({
    history: [
      { role: 'user', content: 'First' },
      { role: 'assistant', content: 'Second' },
      { role: 'user', content: 'Third' }
    ],
    governedInstructions: 'Governed instructions',
    assets: []
  })) {
    void _event;
  }

  assert.deepEqual(capturedInput, [
    { role: 'user', content: [{ type: 'input_text', text: 'First' }] },
    { role: 'assistant', content: [{ type: 'output_text', text: 'Second' }] },
    { role: 'user', content: [{ type: 'input_text', text: 'Third' }] }
  ]);
});

test('openai adapter rejects invalid payloads before calling the provider', async () => {
  let createCalled = false;
  const adapter = createOpenAIAdapter({
    model: '',
    client: {
      responses: {
        create() {
          createCalled = true;
          throw new Error('should_not_call_provider');
        }
      }
    }
  });

  const events = [];
  for await (const event of adapter.streamChat({
    history: [{ role: 'user', content: 'Hello' }],
    governedInstructions: 'Governed instructions',
    assets: []
  })) {
    events.push(event);
  }

  assert.equal(createCalled, false);
  const errorEvent = events.find((event) => event.type === 'error');
  assert.equal(errorEvent?.type, 'error');
  assert.equal(errorEvent?.code, 'provider_payload_invalid');
});
