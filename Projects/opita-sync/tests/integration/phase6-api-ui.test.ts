import assert from 'node:assert/strict';
import test from 'node:test';

import { areGovernanceAndSettingsSeparated, CANONICAL_NAVIGATION } from '../../apps/web/src/navigation.js';
import { CANONICAL_ROUTES, launchCatalogAssetIntoOperate } from '../../services/api/src/index.js';

test('canonical navigation preserves separate Governance and Settings', () => {
  assert.equal(areGovernanceAndSettingsSeparated(), true);
  assert.deepEqual(CANONICAL_NAVIGATION.map((item) => item.key), ['operate', 'catalog', 'inbox', 'activity', 'governance', 'settings']);
});

test('catalog launches into operate instead of bypassing it', () => {
  const launch = launchCatalogAssetIntoOperate('workflow_1');
  assert.equal(launch.route, CANONICAL_ROUTES.operate);
  assert.equal(launch.seededContractSource, 'catalog_launch');
  assert.equal(launch.seededAssetId, 'workflow_1');
});
