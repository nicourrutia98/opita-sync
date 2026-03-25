import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import * as renderModule from '../apps/web/src/render.js';
import { approvePreExecution, approveRelease, runReleaseCheck, startRun } from '../services/api/src/runtime-api.js';
import { loadState, saveState, DEFAULT_STATE_PATH } from '../services/api/src/store.js';
import { startApiServer } from '../services/api/src/server.js';
import type { ApiState } from '../services/api/src/state-types.js';

export interface DbSmokeSummary {
  ok: boolean;
  statePath: string;
  version: number;
  updatedAt: string;
  policyCount: number;
  catalogCount: number;
  runCount: number;
  latestRun: null | {
    runId: string;
    objective: string;
    runState: string;
    approvalState: string | null;
    releaseDecision: string | null;
  };
}

export interface WebSmokeSummary {
  ok: boolean;
  out: string;
  bytes: number;
  contains: string[];
}

export interface ApiSmokeSummary {
  ok: boolean;
  baseUrl: string;
  checks: Record<string, unknown>;
}

export function summarizeState(state: ApiState, statePath: string = DEFAULT_STATE_PATH): DbSmokeSummary {
  const latestRun = state.runRecords[state.runRecords.length - 1];
  return {
    ok: true,
    statePath,
    version: state.version,
    updatedAt: state.updatedAt,
    policyCount: state.policySet.rules.length,
    catalogCount: state.catalog.length,
    runCount: state.runRecords.length,
    latestRun: latestRun
      ? {
          runId: latestRun.runId,
          objective: latestRun.contract.objectiveText,
          runState: latestRun.run.state,
          approvalState: latestRun.approvalCase?.state ?? null,
          releaseDecision: latestRun.releaseDecision?.decision ?? null
        }
      : null
  };
}

export async function ensureSeededState(statePath: string = DEFAULT_STATE_PATH): Promise<DbSmokeSummary> {
  const state = await loadState(statePath);

  if (state.runRecords.length === 0) {
    const record = startRun(state, {
      rawIntent: 'Prepare governed customer follow-up draft',
      approvalMode: 'pre-application',
      externalSend: false,
      mixedAuthority: false,
      classificationLevel: 'confidential'
    });

    runReleaseCheck(state, {
      runId: record.runId,
      mixedAuthority: false
    });

    await saveState(state, statePath);
  }

  return summarizeState(state, statePath);
}

export async function renderWebSmokeSnapshot(out = join(process.cwd(), 'cache', 'smoke', 'web-smoke-output.html')): Promise<WebSmokeSummary> {
  await mkdir(dirname(out), { recursive: true });
  const renderWebAppHtml = (renderModule as unknown as { renderWebAppHtml?: () => string; default?: { renderWebAppHtml?: () => string } }).renderWebAppHtml
    ?? (renderModule as unknown as { default?: { renderWebAppHtml?: () => string } }).default?.renderWebAppHtml;
  if (!renderWebAppHtml) {
    throw new Error('renderWebAppHtml export was not found in apps/web/src/render');
  }
  const html = renderWebAppHtml();
  await writeFile(out, html, 'utf8');
  const contains = ['Operate', 'Catalog', 'Inbox', 'Activity', 'Governance', 'Settings'].filter((item) => html.includes(item));
  return {
    ok: contains.length === 6,
    out,
    bytes: html.length,
    contains
  };
}

async function post(baseUrl: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function extractRunRecord(payload: unknown): any | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = (payload as { record?: unknown }).record;
  if (record && typeof record === 'object') return record;
  return payload as any;
}

export async function runApiSmokeSuite(): Promise<ApiSmokeSummary> {
  const dir = await mkdtemp(join(tmpdir(), 'opita-api-smoke-'));
  const statePath = join(dir, 'state.json');
  const api = await startApiServer({ statePath });

  try {
    const health = await fetch(`${api.baseUrl}/health`).then((r) => r.json());
    const viewModelBefore = await fetch(`${api.baseUrl}/api/view-model`).then((r) => r.json());

    const startedApproval = await post(api.baseUrl, '/api/runs/start', {
      rawIntent: 'Prepare governed follow-up draft for customer thread',
      approvalMode: 'pre-application'
    }).then((r) => r.json());
    const approvalReleaseHold = await post(api.baseUrl, `/api/runs/${startedApproval.runId}/release-check`, {}).then((r) => r.json());
    const approvalReleaseApproved = await post(api.baseUrl, `/api/runs/${startedApproval.runId}/approve-release`, {}).then((r) => r.json());
    const approvalDetails = extractRunRecord(await fetch(`${api.baseUrl}/api/runs/${startedApproval.runId}`).then((r) => r.json()));

    const startedPreExecution = await post(api.baseUrl, '/api/runs/start', {
      rawIntent: 'Execute governed triage workflow',
      approvalMode: 'pre-execution'
    }).then((r) => r.json());
    const preExecutionApproved = await post(api.baseUrl, `/api/runs/${startedPreExecution.runId}/approve-pre-execution`, {}).then((r) => r.json());
    const preExecutionRelease = await post(api.baseUrl, `/api/runs/${startedPreExecution.runId}/release-check`, {}).then((r) => r.json());
    const preExecutionDetails = extractRunRecord(await fetch(`${api.baseUrl}/api/runs/${startedPreExecution.runId}`).then((r) => r.json()));

    const startedMixedAuthority = await post(api.baseUrl, '/api/runs/start', {
      rawIntent: 'Draft a customer summary that accidentally mixes restricted and allowed content',
      approvalMode: 'pre-application'
    }).then((r) => r.json());
    const mixedAuthorityRelease = await post(api.baseUrl, `/api/runs/${startedMixedAuthority.runId}/release-check`, {
      mixedAuthority: true
    }).then((r) => r.json());
    const mixedAuthorityDetails = extractRunRecord(await fetch(`${api.baseUrl}/api/runs/${startedMixedAuthority.runId}`).then((r) => r.json()));

    const checks = {
      healthOk: health.ok === true,
      viewModelReady: viewModelBefore?.operate?.contractStatus === 'draft',
      approvalPath: {
        start: startedApproval.runState,
        releaseHold: approvalReleaseHold.releaseDecision,
        releaseApprove: approvalReleaseApproved.releaseDecision,
        finalState: approvalDetails?.runState ?? null,
        runtimeEvents: approvalDetails?.timeline?.map((event: { label: string }) => event.label) ?? []
      },
      preExecutionPath: {
        start: startedPreExecution.runState,
        approval: preExecutionApproved.approvalState,
        release: preExecutionRelease.releaseDecision,
        finalState: preExecutionDetails?.runState ?? null,
        runtimeEvents: preExecutionDetails?.timeline?.map((event: { label: string }) => event.label) ?? []
      },
      mixedAuthorityPath: {
        start: startedMixedAuthority.runState,
        release: mixedAuthorityRelease.releaseDecision,
        finalState: mixedAuthorityDetails?.runState ?? null,
        runtimeEvents: mixedAuthorityDetails?.timeline?.map((event: { label: string }) => event.label) ?? []
      }
    };

    const ok =
      checks.healthOk &&
      checks.viewModelReady &&
      checks.approvalPath.releaseHold === 'hold_for_approval' &&
      checks.approvalPath.releaseApprove === 'release' &&
      checks.approvalPath.finalState === 'released' &&
      checks.preExecutionPath.start === 'waiting_approval' &&
      checks.preExecutionPath.approval === 'approved' &&
      checks.preExecutionPath.release === 'release' &&
      checks.preExecutionPath.finalState === 'released' &&
      checks.mixedAuthorityPath.release === 'block' &&
      checks.mixedAuthorityPath.finalState === 'release_blocked';

    return {
      ok,
      baseUrl: api.baseUrl,
      checks
    };
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
}
