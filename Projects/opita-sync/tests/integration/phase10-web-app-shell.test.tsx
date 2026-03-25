import assert from 'node:assert/strict';
import test from 'node:test';

import { getWebAppViewModel } from '../../services/api/src/mock-web-app.js';
import { renderWebAppHtml } from '../../apps/web/src/render.js';

test('web app shell renders all canonical modules and governed signals', () => {
  const model = getWebAppViewModel();
  const html = renderWebAppHtml();

  assert.equal(model.operate.contractStatus, 'approval_required');
  assert.ok(html.includes('Operate'));
  assert.ok(html.includes('Catalog'));
  assert.ok(html.includes('Inbox'));
  assert.ok(html.includes('Activity'));
  assert.ok(html.includes('Governance'));
  assert.ok(html.includes('Settings'));
  assert.ok(html.includes('Approval required before any final apply/send effect.'));
  assert.ok(html.includes('prod publication locked to superadmin'));
});
