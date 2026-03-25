import assert from 'node:assert/strict';
import test from 'node:test';

import { createApprovalCase } from '../../packages/approvals/src/index.js';
import { evaluateClassification } from '../../packages/classification/src/index.js';
import { decideRelease, analyzeMixedAuthority, type OutputArtifact } from '../../packages/output-control/src/index.js';
import { evaluatePolicy, type PolicySet } from '../../packages/policy-engine/src/index.js';

const baseArtifact: OutputArtifact = { outputArtifactId: 'output_1', runId: 'run_1', artifactType: 'user_visible', classificationMarks: ['confidential'], generatedAt: '2026-01-01T00:00:00.000Z', content: 'Generated content' };
const allowPolicy: PolicySet = { policySetId: 'policy_allow', version: '1.0.0', scope: 'tenant', status: 'active', rules: [{ ruleId: 'allow', effect: 'allow', precedenceWeight: 1, conditions: [], explanationTemplate: 'Allowed.' }] };

test('mixed-authority output blocks by default', () => {
  const mixed = analyzeMixedAuthority({ outputArtifact: baseArtifact, allowedContentDetected: true, disallowedContentDetected: true, rationale: 'Contains both allowed and disallowed content.' });
  const classification = evaluateClassification({ artifactId: 'classification_1', classification: { level: 'confidential', tags: ['customer'] }, ceiling: 'confidential', mixedAuthority: true });
  const release = decideRelease({ outputArtifact: baseArtifact, mixedAuthorityAnalysis: mixed, classificationEvaluation: classification, policyDecision: evaluatePolicy({ policySet: allowPolicy, matchedRuleIds: ['allow'] }) });
  assert.equal(release.decision, 'block');
});

test('pre-application release waits for approval', () => {
  const mixed = analyzeMixedAuthority({ outputArtifact: baseArtifact, allowedContentDetected: true, disallowedContentDetected: false, rationale: 'Allowed only.' });
  const classification = evaluateClassification({ artifactId: 'classification_2', classification: { level: 'confidential', tags: ['customer'] }, ceiling: 'confidential', mixedAuthority: false });
  const approval = createApprovalCase({ approvalCaseId: 'approval_pre_apply', runId: 'run_1', contractId: 'contract_1', contractRevision: 1, mode: 'pre-application', approverIds: ['approver_1'], evidenceRefs: [] });
  const release = decideRelease({ outputArtifact: baseArtifact, mixedAuthorityAnalysis: mixed, classificationEvaluation: classification, policyDecision: evaluatePolicy({ policySet: allowPolicy, matchedRuleIds: ['allow'] }), approvalCase: approval });
  assert.equal(release.decision, 'hold_for_approval');
});
