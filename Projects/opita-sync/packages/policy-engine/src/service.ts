import type { PolicyDecisionArtifact, PolicyRule, PolicySet } from './models.js';

const OUTCOME_ORDER: Record<PolicyDecisionArtifact['outcome'], number> = {
  allow: 0,
  allow_with_restrictions: 1,
  require_approval: 2,
  require_redaction_path: 3,
  deny: 4
};

function mapRuleEffectToOutcome(rule: PolicyRule): PolicyDecisionArtifact['outcome'] {
  switch (rule.effect) {
    case 'allow':
      return 'allow';
    case 'allow_with_obligations':
      return 'allow_with_restrictions';
    case 'require_approval':
      return 'require_approval';
    case 'require_redaction':
      return 'require_redaction_path';
    case 'deny':
      return 'deny';
  }
}

export function evaluatePolicy(input: {
  policySet: PolicySet;
  matchedRuleIds?: string[];
  restrictedConnectorIds?: string[];
  restrictedDataDomains?: string[];
}): PolicyDecisionArtifact {
  const matchedRules = input.policySet.rules.filter((rule) => (input.matchedRuleIds ?? input.policySet.rules.map((r) => r.ruleId)).includes(rule.ruleId));

  if (matchedRules.length === 0) {
    return {
      decisionId: `${input.policySet.policySetId}:deny-default`,
      outcome: 'deny',
      matchedRuleIds: [],
      restrictiveRuleIds: [],
      obligations: [],
      restrictedConnectorIds: input.restrictedConnectorIds ?? [],
      restrictedDataDomains: input.restrictedDataDomains ?? [],
      approvalRequirements: [],
      explanationSummary: 'Denied by default because no policy rule proved the request is allowed.',
      createdAt: new Date().toISOString()
    };
  }

  const sorted = [...matchedRules].sort((left, right) => {
    const outcomeDelta = OUTCOME_ORDER[mapRuleEffectToOutcome(right)] - OUTCOME_ORDER[mapRuleEffectToOutcome(left)];
    if (outcomeDelta !== 0) return outcomeDelta;
    return right.precedenceWeight - left.precedenceWeight;
  });

  const decisive = sorted[0]!;
  const outcome = mapRuleEffectToOutcome(decisive);

  return {
    decisionId: `${input.policySet.policySetId}:${decisive.ruleId}`,
    outcome,
    matchedRuleIds: matchedRules.map((rule) => rule.ruleId),
    restrictiveRuleIds: matchedRules.filter((rule) => mapRuleEffectToOutcome(rule) === outcome).map((rule) => rule.ruleId),
    obligations: matchedRules.flatMap((rule) => rule.obligations ?? []),
    restrictedConnectorIds: input.restrictedConnectorIds ?? [],
    restrictedDataDomains: input.restrictedDataDomains ?? [],
    approvalRequirements: outcome === 'require_approval' ? ['approval_required'] : [],
    explanationSummary: decisive.explanationTemplate,
    createdAt: new Date().toISOString()
  };
}
