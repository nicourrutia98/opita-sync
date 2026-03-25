import type { RunState } from './models.js';

export type RunEventType =
  | 'run.created'
  | 'run.waiting_approval'
  | 'run.resumed'
  | 'run.execution_completed'
  | 'run.output_review'
  | 'run.release_blocked'
  | 'run.release_held'
  | 'run.released';

export interface RunEvent {
  eventId: string;
  runId: string;
  eventType: RunEventType;
  fromState?: RunState;
  toState: RunState;
  occurredAt: string;
  reason?: string;
}

const ALLOWED: Partial<Record<RunState, RunState[]>> = {
  created: ['queued', 'approval_required_pre_execution', 'waiting_approval'],
  approval_required_pre_execution: ['waiting_approval'],
  waiting_approval: ['resuming'],
  resuming: ['running', 'execution_completed'],
  queued: ['running', 'execution_completed'],
  running: ['execution_completed', 'step_failed_retryable', 'step_failed_terminal', 'waiting_external', 'waiting_approval'],
  execution_completed: ['output_review'],
  output_review: ['release_blocked', 'release_approval_required', 'release_redacted', 'released'],
  release_approval_required: ['released'],
  release_redacted: ['released'],
  released: ['applied']
};

export function assertRunTransition(from: RunState, to: RunState): void {
  const allowed = ALLOWED[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid run transition from ${from} to ${to}`);
  }
}

export function createRunEvent(input: {
  runId: string;
  eventType: RunEventType;
  toState: RunState;
  fromState?: RunState;
  reason?: string;
  occurredAt?: string;
}): RunEvent {
  if (input.fromState) {
    assertRunTransition(input.fromState, input.toState);
  }
  return {
    eventId: `run-event:${input.runId}:${input.eventType}:${Date.now()}`,
    runId: input.runId,
    eventType: input.eventType,
    fromState: input.fromState,
    toState: input.toState,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    reason: input.reason
  };
}
