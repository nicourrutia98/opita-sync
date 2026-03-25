import type { PolicyOutcome } from '../../domain/src/index.js';

export interface PolicyRule {
  ruleId: string;
  effect: 'deny' | 'allow' | 'allow_with_obligations' | 'require_approval' | 'require_redaction';
  precedenceWeight: number;
  conditions: string[];
  obligations?: string[];
  explanationTemplate: string;
}

export interface PolicySet {
  policySetId: string;
  version: string;
  scope: 'platform' | 'tenant' | 'environment' | 'domain';
  status: 'draft' | 'approved' | 'active' | 'retired';
  rules: PolicyRule[];
}

export interface PolicyDecisionArtifact {
  decisionId: string;
  outcome: PolicyOutcome;
  matchedRuleIds: string[];
  restrictiveRuleIds: string[];
  obligations: string[];
  restrictedConnectorIds: string[];
  restrictedDataDomains: string[];
  approvalRequirements: string[];
  explanationSummary: string;
  createdAt: string;
}
