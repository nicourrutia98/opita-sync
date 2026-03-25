'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, CircleAlert, ClipboardList, FileText, PlayCircle, RefreshCw, ShieldAlert, TimerReset } from 'lucide-react';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  MetricCard,
  Separator,
  StateBlock,
  Textarea
} from '../../../../packages/ui-core/src/primitives.js';
import { NavChip } from '../components.js';
import { approvePreExecution, approveRelease, fetchActivity, fetchRun, fetchViewModel, releaseCheck, startRun } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import { runComposerSchema, type RunComposerValues } from '../lib/schemas.js';
import type { RunDetailResponse } from '../lib/types.js';
import { useRunStream } from '../lib/use-stream.js';

function FieldLabel({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>{children}</div>;
}

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

function RunTimeline({ events }: { events: Array<{ occurredAt: string; label: string; stateFrom?: string; stateTo?: string; detail?: string }> }) {
  if (!events.length) {
    return <StateBlock tone="empty" title="Sin timeline" description="Todavía no hay eventos de ejecución para este run." />;
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {events.map((event) => (
        <div key={`${event.occurredAt}-${event.label}`} style={{ display: 'grid', gap: 4, padding: 14, borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <strong style={{ fontSize: 14 }}>{event.label}</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(event.occurredAt).toLocaleString()}</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.45 }}>
            {event.stateFrom && event.stateTo ? `${event.stateFrom} → ${event.stateTo}` : event.detail ?? 'Evento gobernado'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OperatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const runId = searchParams.get('runId');
  const assetId = searchParams.get('assetId');
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const viewModelQuery = useQuery({
    queryKey: queryKeys.viewModel,
    queryFn: fetchViewModel
  });

  const activityQuery = useQuery({
    queryKey: queryKeys.activity,
    queryFn: fetchActivity
  });

  const selectedAsset = useMemo(
    () => viewModelQuery.data?.catalog.find((item) => item.assetId === assetId) ?? viewModelQuery.data?.catalog[0] ?? null,
    [assetId, viewModelQuery.data?.catalog]
  );

  const defaultValues = useMemo<RunComposerValues>(
    () => ({
      rawIntent: selectedAsset?.description ?? 'Prepare a governed customer follow-up draft',
      approvalMode: (selectedAsset?.approvalMode as RunComposerValues['approvalMode']) ?? 'pre-application',
      classificationLevel: 'confidential',
      requestedActionAssetId: selectedAsset?.assetId,
      mixedAuthority: false,
      externalSend: false
    }),
    [selectedAsset]
  );

  const form = useForm<RunComposerValues>({
    resolver: zodResolver(runComposerSchema),
    defaultValues
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const runQuery = useQuery({
    queryKey: queryKeys.run(runId ?? '__none__'),
    queryFn: () => fetchRun(runId ?? ''),
    enabled: Boolean(runId)
  });

  useRunStream(runId);

  const launchMutation = useMutation({
    mutationFn: (values: RunComposerValues) =>
      startRun({
        rawIntent: values.rawIntent,
        approvalMode: values.approvalMode,
        classificationLevel: values.classificationLevel,
        requestedActionAssetId: values.requestedActionAssetId,
        mixedAuthority: values.mixedAuthority,
        externalSend: values.externalSend
      }),
    onSuccess: async (result, values) => {
      setStatusNote(`Run ${result.runId} created.`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
      router.replace(`/operate?runId=${result.runId}${values.requestedActionAssetId ? `&assetId=${values.requestedActionAssetId}` : ''}`);
    }
  });

  const releaseCheckMutation = useMutation({
    mutationFn: () => releaseCheck(runId!, { mixedAuthority: form.getValues('mixedAuthority') }),
    onSuccess: async () => {
      setStatusNote('Release check executed.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.run(runId ?? '__none__') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
    }
  });

  const approveReleaseMutation = useMutation({
    mutationFn: () => approveRelease(runId!),
    onSuccess: async () => {
      setStatusNote('Release approved.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.run(runId ?? '__none__') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
    }
  });

  const approvePreExecutionMutation = useMutation({
    mutationFn: () => approvePreExecution(runId!),
    onSuccess: async () => {
      setStatusNote('Pre-execution approval granted.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.run(runId ?? '__none__') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
    }
  });

  const run = runQuery.data;
  const summary = run?.runState ?? viewModelQuery.data?.operate.contractStatus ?? 'idle';
  const recentRuns: RunDetailResponse[] = activityQuery.data?.items ?? [];

  return (
    <AppShellLayout
      area="operate"
      title="Operate"
      subtitle="Workspace de ejecución gobernada. El contrato, la policy y el output control siempre están a la vista."
      summary={summary}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      inspector={
        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <CardContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <PanelTitle title="Acciones rápidas" subtitle="Navega el contexto sin salir de Operate." />
                <Separator />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      if (run?.runId) {
                        await navigator.clipboard.writeText(run.runId);
                        setStatusNote(`Copied ${run.runId} to clipboard.`);
                      }
                    }}
                    disabled={!run?.runId}
                  >
                    Copy run id
                  </Button>
                  {run?.runId && <NavChip href={`/activity?runId=${encodeURIComponent(run.runId)}`}>Open in Activity</NavChip>}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
                      if (run?.runId) void queryClient.invalidateQueries({ queryKey: queryKeys.run(run.runId) });
                      setStatusNote('Refreshed governed view model.');
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={14} />
                      Refresh
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <PanelTitle title="Contexto de riesgo" subtitle="La consola no oculta por qué algo fue permitido, retenido o bloqueado." />
                <Separator />
                <div style={{ display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div>Policy state: {viewModelQuery.data?.operate.policyState ?? 'not_loaded'}</div>
                  <div>Release state: {viewModelQuery.data?.operate.releaseState ?? 'not_loaded'}</div>
                  <div>Asset: {selectedAsset?.name ?? 'None selected'}</div>
                  <div>Approval mode: {selectedAsset?.approvalMode ?? 'pre-application'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <PanelTitle title="Inspector de contracto" subtitle="Señales visibles para auditoría operativa." />
                <Separator />
                <div style={{ display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div>Owner: user_1</div>
                  <div>Tenant: tenant_1</div>
                  <div>Environment: dev</div>
                  <div>Classification ceiling: confidential</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <PanelTitle title="Recent runs" subtitle="Tap into prior executions directly from the workspace." />
                <Separator />
                <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflow: 'auto' }}>
                  {recentRuns.slice(0, 5).map((item) => (
                    <button
                      key={item.runId}
                      type="button"
                      onClick={() => router.push(`/operate?runId=${encodeURIComponent(item.runId)}`)}
                      style={{
                        display: 'grid',
                        gap: 4,
                        textAlign: 'left',
                        padding: 12,
                        borderRadius: 16,
                        border: `1px solid ${item.runId === run?.runId ? 'var(--brand)' : 'var(--line)'}`,
                        background: item.runId === run?.runId ? 'var(--brand-soft)' : 'var(--surface)',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: 13 }}>{item.objective}</strong>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.runId} · {item.runState} · {item.releaseDecision}</span>
                      </button>
                  ))}
                  {!recentRuns.length && <StateBlock tone="empty" title="No recent runs" description="Create or release a run to populate quick access." />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        {statusNote && <StateBlock tone="success" title="Actualizado" description={statusNote} />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          <MetricCard label="Estado" value={run?.runState ?? 'idle'} helper="Run state visible en vivo." />
          <MetricCard label="Policy" value={viewModelQuery.data?.operate.policyState ?? 'n/a'} helper="Policy validation response." />
          <MetricCard label="Release" value={viewModelQuery.data?.operate.releaseState ?? 'n/a'} helper="Output control decision." />
          <MetricCard label="Approval" value={run?.approvalState ?? 'none'} helper="Human gate visibility." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)', gap: 18, alignItems: 'start' }}>
          <Card>
            <CardHeader>
              <PanelTitle title="Composer gobernado" subtitle="El usuario expresa intención; la policy y el contrato la enmarcan." />
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((values) => launchMutation.mutate(values))}
                style={{ display: 'grid', gap: 14 }}
              >
                <div style={{ display: 'grid', gap: 8 }}>
                  <FieldLabel>Intención</FieldLabel>
                  <Textarea rows={5} {...form.register('rawIntent')} />
                  {form.formState.errors.rawIntent && <div style={{ color: 'var(--danger)', fontSize: 12 }}>{form.formState.errors.rawIntent.message}</div>}
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <FieldLabel>Asset quick switch</FieldLabel>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(viewModelQuery.data?.catalog ?? []).map((item) => (
                      <NavChip
                      key={item.assetId}
                      href={`/operate?assetId=${encodeURIComponent(item.assetId)}${runId ? `&runId=${encodeURIComponent(runId)}` : ''}`}
                      active={item.assetId === selectedAsset?.assetId}
                    >
                      {item.name}
                    </NavChip>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <FieldLabel>Approval mode</FieldLabel>
                    <select {...form.register('approvalMode')} style={{ height: 44, borderRadius: 16, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', padding: '0 14px' }}>
                      <option value="auto">auto</option>
                      <option value="pre-execution">pre-execution</option>
                      <option value="pre-application">pre-application</option>
                      <option value="double_approval">double_approval</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <FieldLabel>Classification</FieldLabel>
                    <select {...form.register('classificationLevel')} style={{ height: 44, borderRadius: 16, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', padding: '0 14px' }}>
                      <option value="internal">internal</option>
                      <option value="confidential">confidential</option>
                      <option value="restricted">restricted</option>
                      <option value="high_impact">high_impact</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)', fontSize: 14 }}>
                    <input type="checkbox" {...form.register('mixedAuthority')} />
                    Mixed authority
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)', fontSize: 14 }}>
                    <input type="checkbox" {...form.register('externalSend')} />
                    External send
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Button type="submit" disabled={launchMutation.isPending}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <PlayCircle size={16} />
                      {launchMutation.isPending ? 'Launching…' : 'Start run'}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      form.reset(defaultValues);
                      setStatusNote('Composer restored to the seeded asset defaults.');
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div style={{ display: 'grid', gap: 18 }}>
            <Card>
              <CardHeader>
                <PanelTitle title="Contexto del contrato" subtitle="La UI muestra el objetivo, restricciones y el estado del contrato." />
              </CardHeader>
              <CardContent>
                {run ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <Badge tone="brand">{run.runState}</Badge>
                      <Badge tone="muted">{run.approvalMode}</Badge>
                    </div>
                    <div style={{ display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                      <div><strong style={{ color: 'var(--ink)' }}>Objective:</strong> {run.objective}</div>
                      <div><strong style={{ color: 'var(--ink)' }}>Policy:</strong> {run.policyOutcome}</div>
                      <div><strong style={{ color: 'var(--ink)' }}>Classification:</strong> {run.classificationLevel}</div>
                      <div><strong style={{ color: 'var(--ink)' }}>Release:</strong> {run.releaseDecision}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <Button variant="secondary" onClick={() => releaseCheckMutation.mutate()} disabled={!runId || releaseCheckMutation.isPending}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <ShieldAlert size={16} />
                          {releaseCheckMutation.isPending ? 'Checking…' : 'Run release check'}
                        </span>
                      </Button>
                      <Button variant="secondary" onClick={() => approveReleaseMutation.mutate()} disabled={!runId || approveReleaseMutation.isPending}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle2 size={16} />
                          Approve release
                        </span>
                      </Button>
                      <Button variant="secondary" onClick={() => approvePreExecutionMutation.mutate()} disabled={!runId || approvePreExecutionMutation.isPending}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <TimerReset size={16} />
                          Approve pre-exec
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <StateBlock tone="empty" title="Aún no hay run activo" description="Lanza una intención gobernada para ver contrato, policy, approvals y output control." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <PanelTitle title="Plan preview" subtitle="La compilación no se convierte en caja negra." />
              </CardHeader>
              <CardContent>
                {run?.planSteps.length ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {run.planSteps.map((step, index) => (
                      <button
                        key={step.stepId}
                        type="button"
                        onClick={() => setStatusNote(`Focused on ${step.stepId} (${step.assetRef}).`)}
                        style={{ display: 'grid', gridTemplateColumns: '32px minmax(0,1fr)', gap: 12, alignItems: 'start', padding: 12, border: '1px solid var(--line)', borderRadius: 18, textAlign: 'left', cursor: 'pointer', background: 'var(--surface)' }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--brand-soft)', color: 'var(--brand-strong)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{index + 1}</div>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <strong>{step.stepId}</strong>
                          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{step.assetRef}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <StateBlock tone="empty" title="Sin plan visible" description="Después de crear un run, la preview del plan aparece aquí." />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.92fr)', gap: 18, alignItems: 'start' }}>
          <Card>
            <CardHeader>
              <PanelTitle title="Timeline y evidencias" subtitle="La historia de la ejecución es auditable y legible." />
            </CardHeader>
            <CardContent>
              {run ? <RunTimeline events={run.timeline} /> : <StateBlock tone="empty" title="Sin actividad" description="Crea un run para ver el trail de estados, approvals y release control." />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PanelTitle title="Señales de control" subtitle="Bloqueos, redacción y escalaciones siempre visibles." />
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CircleAlert size={18} color="var(--warning)" />
                  <div>
                    <strong>Mixed-authority blocked by default</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>Si el output mezcla autoridad o clasificación, el control de salida retiene el release.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <FileText size={18} color="var(--brand-strong)" />
                  <div>
                    <strong>Plan + contract linkage</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>Cada plan visible está atado al contrato y a la policy que lo permite.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <ClipboardList size={18} color="var(--brand-strong)" />
                  <div>
                    <strong>Audit first</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>La trazabilidad no es un panel secundario, es parte del flujo principal.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellLayout>
  );
}
