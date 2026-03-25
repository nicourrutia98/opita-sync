import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluatePolicy } from '../../packages/policy-engine/src/index.js';
import type { PolicySet } from '../../packages/policy-engine/src/index.js';

const policySet: PolicySet = {
  policySetId: 'policy_core',
  version: '1.0.0',
  scope: 'tenant',
  status: 'active',
  rules: [
    {
      ruleId: 'allow_base',
      effect: 'allow',
      precedenceWeight: 1,
      conditions: ['role=end_user'],
      explanationTemplate: 'Allowed by baseline tenant policy.'
    },
    {
      ruleId: 'require_approval_hr',
      effect: 'require_approval',
      precedenceWeight: 5,
      conditions: ['domain=hr'],
      obligations: ['approval:hr-manager'],
      explanationTemplate: 'Approval required for HR-sensitive operation.'
    },
    {
      ruleId: 'deny_restricted_send',
      effect: 'deny',
      precedenceWeight: 10,
      conditions: ['classification=restricted', 'action=send'],
      explanationTemplate: 'Denied because restricted data cannot be sent directly.'
    }
  ]
};

test('policy engine denies by default when no rule matches', () => {
  const decision = evaluatePolicy({ policySet, matchedRuleIds: [] });
  assert.equal(decision.outcome, 'deny');
  assert.match(decision.explanationSummary, /Denied by default/);
});

test('most restrictive rule wins over allow', () => {
  const decision = evaluatePolicy({ policySet, matchedRuleIds: ['allow_base', 'deny_restricted_send'] });
  assert.equal(decision.outcome, 'deny');
  assert.deepEqual(decision.restrictiveRuleIds, ['deny_restricted_send']);
});

test('require approval produces explicit approval requirement and obligations', () => {
  const decision = evaluatePolicy({ policySet, matchedRuleIds: ['allow_base', 'require_approval_hr'] });
  assert.equal(decision.outcome, 'require_approval');
  assert.deepEqual(decision.approvalRequirements, ['approval_required']);
  assert.ok(decision.obligations.includes('approval:hr-manager'));
});
