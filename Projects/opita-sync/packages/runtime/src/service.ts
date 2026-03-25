import type { ApprovalCase } from '../../approvals/src/index.js';
import type { ExecutionContract } from '../../contracts/src/index.js';
import type { ExecutionPlanArtifact } from '../../orchestrator/src/index.js';
import type { RetryRecord, Run, RunStep, RuntimeExecutionResult, WaitState } from './models.js';

function timestamp(): string { return new Date().toISOString(); }

export function createRun(contract: ExecutionContract, plan: ExecutionPlanArtifact): Run {
  return {
    runId: `run:${contract.contractId}:r${contract.revision}`,
    tenantId: contract.tenantId,
    environment: contract.environment,
    contractId: contract.contractId,
    contractRevision: contract.revision,
    planSnapshot: plan,
    state: plan.approvalMode === 'pre-execution' || plan.approvalMode === 'double_approval' ? 'approval_required_pre_execution' : 'queued',
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
}

export function executeCompiledPlan(input: { contract: ExecutionContract; plan: ExecutionPlanArtifact; preExecutionApprovalCase?: ApprovalCase; }): RuntimeExecutionResult {
  const run = createRun(input.contract, input.plan);
  const waits: WaitState[] = [];
  const retries: RetryRecord[] = [];
  if (run.state === 'approval_required_pre_execution') {
    if (!input.preExecutionApprovalCase || input.preExecutionApprovalCase.state !== 'approved') {
      waits.push({ waitId: `wait:${run.runId}:approval`, runId: run.runId, waitType: 'approval', status: 'pending', resumeToken: `resume:${run.runId}` });
      return { run: { ...run, state: 'waiting_approval', updatedAt: timestamp() }, steps: [], waits, retries, outputDraft: '' };
    }
  }
  const steps: RunStep[] = input.plan.steps.map((step) => ({ runStepId: `run-step:${run.runId}:${step.stepId}`, runId: run.runId, stepId: step.stepId, assetRef: step.assetRef, state: 'completed', retryCount: 0 }));
  return { run: { ...run, state: 'execution_completed', updatedAt: timestamp() }, steps, waits, retries, outputDraft: `Execution completed for ${input.contract.objectiveText}` };
}

export function resumeRunAfterApproval(run: Run, approvalCase: ApprovalCase): Run {
  if (approvalCase.state !== 'approved') throw new Error(`Cannot resume run ${run.runId} without approved approval case`);
  return { ...run, state: 'resuming', updatedAt: timestamp() };
}
