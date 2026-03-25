import type { ApprovalCase } from '../../../packages/approvals/src/index.js';
import type { CatalogAsset } from '../../../packages/catalog/src/index.js';
import type { ClassificationEvaluationArtifact } from '../../../packages/classification/src/index.js';
import type { ExecutionContract } from '../../../packages/contracts/src/index.js';
import type { InboxItem } from '../../../packages/inbox/src/index.js';
import type { AdmissibilityDecisionArtifact, ExecutionPlanArtifact } from '../../../packages/orchestrator/src/index.js';
import type { PolicyDecisionArtifact, PolicySet } from '../../../packages/policy-engine/src/index.js';
import type { ReleaseDecisionArtifact } from '../../../packages/output-control/src/index.js';
import type { Run, RunEvent } from '../../../packages/runtime/src/index.js';
import type { ProviderErrorCode, ProviderId, ProviderToolProposal } from '../../../packages/provider-adapters/src/index.js';
import type { GovernedAnalysisResult } from './analysis-service.js';

export interface RunRecord {
  runId: string;
  contract: ExecutionContract;
  admissibility: AdmissibilityDecisionArtifact;
  policyDecision: PolicyDecisionArtifact;
  classification: ClassificationEvaluationArtifact;
  plan: ExecutionPlanArtifact;
  run: Run;
  approvalCase?: ApprovalCase;
  releaseDecision?: ReleaseDecisionArtifact;
  analysisResult?: GovernedAnalysisResult;
  inboxItems: InboxItem[];
  runtimeEvents: RunEvent[];
}

export interface ChatRecord {
  chatId: string;
  providerId: ProviderId;
  model: string;
  status: 'queued' | 'streaming' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  updatedAt: string;
  sequenceNumber: number;
  latestUserMessage: string;
  latestAssistantMessage: string;
  lastStreamingCheckpoint?: string;
  latestProposals: ProviderToolProposal[];
  summary?: string;
  providerState?: {
    lastResponseId?: string;
    lastRequestId?: string;
    storeEnabled: boolean;
    continuityMode: 'manual' | 'provider' | 'fallback_manual';
    recoverableError?: string;
  };
  history: Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>;
  lastError?: string;
  lastErrorCode?: ProviderErrorCode;
  interrupted?: boolean;
  stoppedAt?: string;
  stopReason?: 'user_stopped';
}

export interface LocalUserRecord {
  userId: string;
  tenantId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  active: boolean;
  roles: string[];
}

export interface LocalSessionRecord {
  sessionId: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
}

export interface ApiState {
  version: 1;
  updatedAt: string;
  policySet: PolicySet;
  catalog: CatalogAsset[];
  runRecords: RunRecord[];
  chatRecords: ChatRecord[];
  localUsers: LocalUserRecord[];
  localSessions: LocalSessionRecord[];
  settings: {
    tenantId: string;
    tenantName: string;
    defaultEnvironment: 'dev' | 'staging' | 'prod';
    preferredProvider: string;
    connectorNotes: string;
  };
}
