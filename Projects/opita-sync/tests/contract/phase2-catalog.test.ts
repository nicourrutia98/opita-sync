import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assessAssetRevisionChange,
  assertPublishedAssetImmutableMeaning,
  assertValidLifecycleTransition,
  isPublishedInEnvironment,
  type ActionAsset
} from '../../packages/catalog/src/index.js';

const actionAsset: ActionAsset = {
  assetId: 'action_1',
  assetKind: 'action',
  name: 'Send governed message',
  description: 'Send a governed outbound message.',
  lifecycleState: 'published',
  version: '1.0.0',
  approvalMode: 'pre-application',
  classificationTags: ['customer'],
  connectorIds: ['connector_email'],
  publishedSemanticHash: 'hash_v1',
  inputContractRef: 'contract:input:v1',
  outputContractRef: 'contract:output:v1'
};

test('catalog lifecycle transitions remain controlled', () => {
  assert.doesNotThrow(() => assertValidLifecycleTransition('draft', 'review'));
  assert.throws(() => assertValidLifecycleTransition('published', 'approved'), /Invalid lifecycle transition/);
});

test('publication is environment-specific', () => {
  assert.equal(
    isPublishedInEnvironment(actionAsset, 'prod', [{ environment: 'prod', active: true }]),
    true
  );
  assert.equal(
    isPublishedInEnvironment(actionAsset, 'staging', [{ environment: 'prod', active: true }]),
    false
  );
});

test('breaking semantic change requires new asset identity', () => {
  const assessment = assessAssetRevisionChange({
    current: actionAsset,
    nextVersion: '2.0.0',
    changedFields: ['outputContractRef'],
    nextPublishedSemanticHash: 'hash_v2'
  });

  assert.equal(assessment.breakingChange, true);
  assert.equal(assessment.requiresNewAssetIdentity, true);
  assert.throws(() => assertPublishedAssetImmutableMeaning(actionAsset, 'hash_v2'), /requires a new asset identity/);
});
