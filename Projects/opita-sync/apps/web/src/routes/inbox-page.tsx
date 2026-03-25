'use client';

import { useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, BellRing, ShieldAlert } from 'lucide-react';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, MetricCard, StateBlock } from '../../../../packages/ui-core/src/primitives.js';
import { DenseTable } from '../../../../packages/ui-core/src/table.js';
import { NavChip } from '../components.js';
import { fetchInbox } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import type { InboxItemSummary } from '../lib/types.js';

const columnHelper = createColumnHelper<InboxItemSummary>();

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

export function InboxPage(props: { auth?: { tenantName: string; userLabel: string } } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<InboxItemSummary | null>(null);
  const inboxQuery = useQuery({ queryKey: queryKeys.inbox, queryFn: fetchInbox });

  const table = useReactTable({
    data: inboxQuery.data?.items ?? [],
    columns: [
      columnHelper.accessor('type', { header: 'Type', cell: (info) => <Badge tone={info.getValue() === 'approval' ? 'warning' : info.getValue() === 'blocked_run' ? 'danger' : 'brand'}>{info.getValue()}</Badge> }),
      columnHelper.accessor('summary', { header: 'Item', cell: (info) => <strong>{info.getValue()}</strong> }),
      columnHelper.accessor('runId', { header: 'Run', cell: (info) => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span> }),
      columnHelper.accessor('actionLabel', { header: 'Action', cell: (info) => <span>{info.getValue()}</span> }),
      columnHelper.display({
        id: 'open',
        header: 'Open',
        cell: (info) => (
          <NavChip href={`/operate?runId=${encodeURIComponent(info.row.original.runId)}`}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={16} />
              Open
            </span>
          </NavChip>
        )
      })
    ],
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <AppShellLayout
      area="inbox"
      title="Inbox"
      subtitle="Queue de trabajo accionable. No es notificación pasiva; cada item exige una transición clara."
      summary={`${inboxQuery.data?.items.length ?? 0} pending`}
      tenantName={props.auth?.tenantName}
      userLabel={props.auth?.userLabel}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      inspector={
        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardContent>
              <PanelTitle title="Selected item" subtitle="El contexto de cada aprobación o bloqueo queda disponible." />
              {selected ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 14, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div><strong style={{ color: 'var(--ink)' }}>{selected.summary}</strong></div>
                  <div>Run: {selected.runId}</div>
                  <div>Severity: {selected.severity}</div>
                  <div>Action: {selected.actionLabel}</div>
                </div>
              ) : (
                <StateBlock tone="empty" title="No selection" description="Select a work item to inspect why it is pending." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <PanelTitle title="Work queue" subtitle="Approvals, escalations, blocked runs and release review." />
              <div style={{ marginTop: 14, display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                <div>Work queue only. No passive noise.</div>
                <div>Every item maps back to a run or approval case.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <MetricCard label="Approvals" value={`${inboxQuery.data?.items.filter((item) => item.type === 'approval').length ?? 0}`} helper="Items waiting on human approval." />
          <MetricCard label="Blocked" value={`${inboxQuery.data?.items.filter((item) => item.type === 'blocked_run').length ?? 0}`} helper="Runs blocked by policy or output control." />
          <MetricCard label="Escalations" value={`${inboxQuery.data?.items.filter((item) => item.type === 'intervention').length ?? 0}`} helper="Intervention required by operator." />
        </div>

        <Card>
          <CardHeader>
            <PanelTitle title="Actionable queue" subtitle="Approvals and blocks are explicit state transitions." />
          </CardHeader>
          <CardContent>
            <DenseTable
              table={table}
              emptyLabel="No actionable items in the queue."
              onRowClick={(row) => setSelected(row)}
            />
          </CardContent>
        </Card>
      </div>
    </AppShellLayout>
  );
}
