import type { AdmissibilityRequestEnvelope, ContractRevision, ExecutionContract } from './models.js';

const GOVERNANCE_RELEVANT_FIELDS = new Set<keyof ExecutionContract>([
  'environment',
  'allowedDataDomains',
  'excludedDataDomains',
  'allowedExternalEffectClass',
  'requestedActionAssetId',
  'requestedWorkflowAssetId',
  'dynamicCompositionRequested',
  'classificationCeiling',
  'allowedConnectorIds',
  'allowedCredentialScopeIds',
  'delegationContextId',
  'approvalExpectationMode',
  'draftGenerationAllowed',
  'applyAllowed',
  'sendAllowed',
  'exportRequested',
  'sendRequested',
  'draftOnly',
  'policyConstraints',
  'classificationConstraints'
]);

function arraysEqual(left: string[] | undefined, right: string[] | undefined): boolean {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? []);
}

export function createExecutionContract(input: Omit<ExecutionContract, 'createdAt' | 'updatedAt'> & Partial<Pick<ExecutionContract, 'createdAt' | 'updatedAt'>>): ExecutionContract {
  const timestamp = new Date().toISOString();
  return {
    ...input,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp
  };
}

export function diffExecutionContracts(previous: ExecutionContract, next: ExecutionContract): string[] {
  const changedFields: string[] = [];
  const keys = new Set<keyof ExecutionContract>([
    ...Object.keys(previous) as Array<keyof ExecutionContract>,
    ...Object.keys(next) as Array<keyof ExecutionContract>
  ]);

  for (const key of keys) {
    const left = previous[key];
    const right = next[key];
    if (Array.isArray(left) || Array.isArray(right)) {
      if (!arraysEqual(left as string[] | undefined, right as string[] | undefined)) {
        changedFields.push(String(key));
      }
      continue;
    }
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      changedFields.push(String(key));
    }
  }
  return changedFields;
}

export function createContractRevision(input: {
  previous?: ExecutionContract;
  next: ExecutionContract;
  actorId: string;
}): ContractRevision {
  const changedFields = input.previous ? diffExecutionContracts(input.previous, input.next) : ['initial'];
  return {
    contractId: input.next.contractId,
    revision: input.next.revision,
    previousRevision: input.previous?.revision,
    changedFields,
    governanceRelevantChange: changedFields.some((field) => GOVERNANCE_RELEVANT_FIELDS.has(field as keyof ExecutionContract)),
    createdAt: input.next.updatedAt,
    actorId: input.actorId,
    snapshot: input.next
  };
}

export function createAdmissibilityRequestEnvelope(contract: ExecutionContract, refs: {
  effectiveAuthorityRef: string;
  policySnapshotRef?: string;
  classificationContextRef: string;
}): AdmissibilityRequestEnvelope {
  return {
    contractSnapshotRef: `contract:${contract.contractId}:r${contract.revision}`,
    effectiveAuthorityRef: refs.effectiveAuthorityRef,
    policySnapshotRef: refs.policySnapshotRef,
    classificationContextRef: refs.classificationContextRef,
    requestedEnvironment: contract.environment,
    requestedAssetRefs: [contract.requestedActionAssetId, contract.requestedWorkflowAssetId].filter(Boolean) as string[],
    requestedConnectorRefs: [...contract.allowedConnectorIds]
  };
}

export function assertContractRequiresReevaluation(revision: ContractRevision): void {
  if (!revision.governanceRelevantChange) {
    return;
  }
}
