'use client';

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import { Badge, Card, CardContent, CardHeader, CardTitle, MetricCard, StateBlock } from '../../../../packages/ui-core/src/primitives.js';
import { DenseTable } from '../../../../packages/ui-core/src/table.js';
import { fetchGovernance } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import type { GovernanceRuleSummary, GovernanceSummary } from '../lib/types.js';

const columnHelper = createColumnHelper<GovernanceRuleSummary>();

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

export function GovernancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const governanceQuery = useQuery({
    queryKey: queryKeys.governance,
    queryFn: fetchGovernance
  });

  const governance = governanceQuery.data;
  const table = useReactTable({
    data: governance?.rules ?? [],
    columns: [
      columnHelper.accessor('ruleId', { header: 'Rule', cell: (info) => <strong>{info.getValue()}</strong> }),
      columnHelper.accessor('effect', { header: 'Effect', cell: (info) => <Badge tone={info.getValue() === 'deny' ? 'danger' : info.getValue() === 'allow' ? 'success' : 'warning'}>{info.getValue()}</Badge> }),
      columnHelper.accessor('precedenceWeight', { header: 'Precedence', cell: (info) => <span>{info.getValue()}</span> }),
      columnHelper.accessor('conditions', { header: 'Conditions', cell: (info) => <span>{info.getValue().join(', ')}</span> }),
      columnHelper.accessor('obligations', { header: 'Obligations', cell: (info) => <span>{info.getValue().join(', ') || '—'}</span> })
    ],
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <AppShellLayout
      area="governance"
      title="Governance"
      subtitle="Autoridad, policy, classification y publication lifecycle permanecen separados de Settings."
      summary={governance?.status ?? 'not_loaded'}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      inspector={
        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardContent>
              <PanelTitle title="Governance posture" subtitle="Why something was allowed, denied or held should be obvious." />
              {governance ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 14, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div>Policy set: {governance.policySetId}</div>
                  <div>Scope: {governance.scope}</div>
                  <div>Classification: {governance.classificationScheme}</div>
                  <div>Publication controls: {governance.publicationControls.length}</div>
                </div>
              ) : (
                <StateBlock tone="empty" title="No governance data" description="Load policy and authority data to inspect the control surface." />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <PanelTitle title="Authority matrix" subtitle="Visibility, use, draft and apply are different decisions." />
              <div style={{ marginTop: 14, display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                <div>Deny by default.</div>
                <div>Most restrictive rule wins.</div>
                <div>Mixed-authority content blocks by default.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          <MetricCard label="Rules" value={`${governance?.rules.length ?? 0}`} helper="Active policy rules." />
          <MetricCard label="Controls" value={`${governance?.publicationControls.length ?? 0}`} helper="Publication lifecycle controls." />
          <MetricCard label="Roles" value={`${governance?.authorityMatrix.length ?? 0}`} helper="Authority dimensions modeled." />
          <MetricCard label="Status" value={governance?.status ?? 'n/a'} helper="Policy set status." />
        </div>

        <Card>
          <CardHeader>
            <PanelTitle title="Policy rules" subtitle="Precedence and obligations are explicit, not hidden." />
          </CardHeader>
          <CardContent>
            <DenseTable table={table} emptyLabel="No rules available." />
          </CardContent>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
          <Card>
            <CardHeader>
              <PanelTitle title="Authority dimensions" subtitle="Separate visibility, use, draft, apply, send and approve." />
            </CardHeader>
            <CardContent>
              {governance ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  {governance.authorityMatrix.map((row) => (
                    <div key={row.dimension} style={{ display: 'grid', gap: 6, padding: 14, borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <strong>{row.dimension}</strong>
                        <Badge tone="muted">{row.roles.length} roles</Badge>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{row.description}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{row.roles.join(', ')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <StateBlock tone="empty" title="No matrix" description="Authority matrix will appear once governance data is loaded." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PanelTitle title="Publication controls" subtitle="Published semantics are immutable." />
            </CardHeader>
            <CardContent>
              {governance ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {governance.publicationControls.map((item) => (
                    <div key={item} style={{ padding: 14, borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <StateBlock tone="empty" title="No publication controls" description="Publication lifecycle controls belong in Governance, not Settings." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShellLayout>
  );
}
