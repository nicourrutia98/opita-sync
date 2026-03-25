import assert from 'node:assert/strict';
import test from 'node:test';

import { anthropicAdapter, geminiAdapter, openaiAdapter } from '../../packages/provider-adapters/src/index.js';

test('provider adapters are neutral and only normalize intent', () => {
  const adapters = [openaiAdapter, anthropicAdapter, geminiAdapter];
  const results = adapters.map((adapter) => adapter.interpretIntent({ rawIntent: '  governed request  ' }));
  assert.deepEqual(results.map((item) => item.normalizedIntent), ['governed request', 'governed request', 'governed request']);
  assert.deepEqual(results.map((item) => item.providerId), ['openai', 'anthropic', 'gemini']);
});
