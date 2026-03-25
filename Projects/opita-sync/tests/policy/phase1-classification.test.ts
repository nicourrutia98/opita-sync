import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateClassification } from '../../packages/classification/src/index.js';

test('classification evaluation flags over-ceiling and mixed-authority restrictions', () => {
  const artifact = evaluateClassification({
    artifactId: 'artifact_1',
    classification: { level: 'high_impact', tags: ['pii', 'regulated'] },
    ceiling: 'confidential',
    mixedAuthority: true
  });

  assert.equal(artifact.mixedAuthorityRisk, 'confirmed');
  assert.ok(artifact.handlingObligations.some((item) => item.includes('classification exceeds ceiling')));
  assert.ok(artifact.releaseRestrictions.includes('block_release'));
  assert.ok(artifact.releaseRestrictions.includes('mixed_authority_review_required'));
});
