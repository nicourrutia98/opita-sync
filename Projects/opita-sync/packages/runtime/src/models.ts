import type { ExecutionPlanArtifact } from '../../orchestrator/src/index.js';

export type RunState = 'created' | 'contract_pending' | 'contract_ready' | 'policy_evaluating' | 'policy_denied' | 'approval_required_pre_execution' | 'admissible' | 'compiling' | 'compiled' | 'queued' | 'running' | 'waiting_external' | 'waiting_approval' | 'resuming' | 'step_failed_retryable' | 'step_failed_terminal' | 'execution_completed' | 'output_review' | 'release_blocked' | 'release_redacted' | 'release_approval_required' | 'released' | 'applied' | 'cancelled' | 'expired';

export interface Run {
  runId: string;
  tenantId: string;
  environment: 'dev' | 'staging' | 'prod';
  contractId: string;
  contractRevision: number;
  planSnapshot: ExecutionPlanArtifact;
  state: RunState;
  createdAt: string;
  updatedAt: string;
}

export interface RunStep {
  runStepId: string;
  runId: string;
  stepId: string;
  assetRef: string;
  state: 'pending' | 'ready' | 'running' | 'waiting' | 'retryable_failure' | 'terminal_failure' | 'completed' | 'skipped';
  retryCount: number;
}

export interface WaitState {
  waitId: string;
  runId: string;
  waitType: 'approval' | 'external_callback' | 'timer' | 'operator_intervention';
  status: 'pending' | 'satisfied' | 'expired' | 'cancelled';
  resumeToken: string;
}

export interface RetryRecord {
  retryId: string;
  runStepId: string;
  attemptNumber: number;
  failureClass: 'retryable' | 'terminal';
  retryDecision: 'retry' | 'fail';
}

export interface RuntimeExecutionResult {
  run: Run;
  steps: RunStep[];
  waits: WaitState[];
  retries: RetryRecord[];
  outputDraft: string;
}
