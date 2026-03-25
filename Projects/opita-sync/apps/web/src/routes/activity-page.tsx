'use client';

import { useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { Clock3, FileClock, History, ShieldAlert } from 'lucide-react';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, MetricCard, StateBlock } from '../../../../packages/ui-core/src/primitives.js';
import { DenseTable } from '../../../../packages/ui-core/src/table.js';
import { fetchActivity, fetchRun } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import type { RunDetailResponse, ActivityItemSummary } from '../lib/types.js';

const columnHelper = createColumnHelper<RunDetailResponse>();

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

function Timeline({ run }: { run?: RunDetailResponse }) {
  if (!run) {
    return <StateBlock tone="empty" title="Select a run" description="Choose a row in the activity table to inspect the audit trail." />;
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {run.timeline.map((event) => (
        <div key={`${event.occurredAt}-${event.label}`} style={{ display: 'grid', gap: 4, padding: 14, border: '1px solid var(--line)', borderRadius: 18, background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <strong>{event.label}</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(event.occurredAt).toLocaleString()}</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{event.detail ?? `${event.stateFrom ?? 'n/a'} → ${event.stateTo ?? 'n/a'}`}</div>
        </div>
      ))}
    </div>
  );
}

export function ActivityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const activityQuery = useQuery({
    queryKey: queryKeys.activity,
    queryFn: fetchActivity
  });

  const runQuery = useQuery({
    queryKey: queryKeys.run(selectedRunId ?? '__none__'),
    queryFn: () => fetchRun(selectedRunId ?? ''),
    enabled: Boolean(selectedRunId)
  });

  const table = useReactTable({
    data: activityQuery.data?.items ?? [],
    columns: [
      columnHelper.accessor('runId', { header: 'Run', cell: (info) => <strong>{info.getValue()}</strong> }),
      columnHelper.accessor('objective', { header: 'Objective', cell: (info) => <span>{info.getValue()}</span> }),
      columnHelper.accessor('runState', { header: 'State', cell: (info) => <Badge tone={info.getValue() === 'released' ? 'success' : info.getValue().includes('blocked') ? 'danger' : 'warning'}>{info.getValue()}</Badge> }),
      columnHelper.accessor('approvalState', { header: 'Approval', cell: (info) => <Badge tone={info.getValue() === 'approved' ? 'success' : 'warning'}>{info.getValue()}</Badge> }),
      columnHelper.accessor('releaseDecision', { header: 'Release', cell: (info) => <Badge tone={info.getValue() === 'release' ? 'success' : info.getValue() === 'block' ? 'danger' : 'warning'}>{info.getValue()}</Badge> })
    ],
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <AppShellLayout
      area="activity"
      title="Activity"
      subtitle="Historial operativo y audit trail. Aquí se ve el recorrido real, no métricas de vanidad."
      summary={`${activityQuery.data?.items.length ?? 0} runs`}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      inspector={
        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardContent>
              <PanelTitle title="Run detail" subtitle="Inspección auditable del run seleccionado." />
              {runQuery.data ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 14, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div><strong style={{ color: 'var(--ink)' }}>{runQuery.data.objective}</strong></div>
                  <div>State: {runQuery.data.runState}</div>
                  <div>Approval: {runQuery.data.approvalState}</div>
                  <div>Release: {runQuery.data.releaseDecision}</div>
                </div>
              ) : (
                <StateBlock tone="empty" title="No run selected" description="Choose a row to see runtime events, approval trail and output decision." />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <PanelTitle title="Audit trail" subtitle="Operative history should be legible and complete." />
              <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                Timeline events, release decisions and approvals remain in the primary workflow surface.
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          <MetricCard label="Runs" value={`${activityQuery.data?.items.length ?? 0}`} helper="Recent governed executions." />
          <MetricCard label="Released" value={`${activityQuery.data?.items.filter((item) => item.releaseDecision === 'release').length ?? 0}`} helper="Released outputs." />
          <MetricCard label="Blocked" value={`${activityQuery.data?.items.filter((item) => item.releaseDecision === 'block').length ?? 0}`} helper="Blocked outputs." />
          <MetricCard label="Pending" value={`${activityQuery.data?.items.filter((item) => item.runState !== 'released').length ?? 0}`} helper="Unresolved operations." />
        </div>

        <Card>
          <CardHeader>
            <PanelTitle title="Operational history" subtitle="Dense, filterable and auditable." />
          </CardHeader>
          <CardContent>
            <DenseTable
              table={table}
              emptyLabel="No activity yet."
              onRowClick={(row) => setSelectedRunId(row.runId)}
            />
          </CardContent>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 18 }}>
          <Card>
            <CardHeader>
              <PanelTitle title="Timeline" subtitle="Status transitions and output control decisions." />
            </CardHeader>
            <CardContent>
              <Timeline run={runQuery.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PanelTitle title="Audit signals" subtitle="Signals that matter to the operator and reviewer." />
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <History size={18} color="var(--brand-strong)" />
                  <div>
                    <strong>Durable history</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>Each run keeps state transitions and evidence in view.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <FileClock size={18} color="var(--brand-strong)" />
                  <div>
                    <strong>Release evidence</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>Output control decisions are visible and traceable.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <ShieldAlert size={18} color="var(--warning)" />
                  <div>
                    <strong>Risk-aware audit</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>Blocks, approvals and redactions are first-class states.</div>
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
