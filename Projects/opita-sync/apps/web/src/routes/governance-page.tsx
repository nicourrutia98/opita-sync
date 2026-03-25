'use client';

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { Copy, Filter } from 'lucide-react';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, MetricCard, StateBlock } from '../../../../packages/ui-core/src/primitives.js';
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

export function GovernancePage(props: { auth?: { tenantName: string; userLabel: string } } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [ruleFilter, setRuleFilter] = useState<'all' | 'allow' | 'deny' | 'hold'>('all');
  const governanceQuery = useQuery({
    queryKey: queryKeys.governance,
    queryFn: fetchGovernance
  });

  const governance = governanceQuery.data;
  const filteredRules = useMemo(() => {
    const items = governance?.rules ?? [];
    return items.filter((rule) => ruleFilter === 'all' || rule.effect === ruleFilter);
  }, [governance?.rules, ruleFilter]);
  const table = useReactTable({
    data: filteredRules,
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
      tenantName={props.auth?.tenantName}
      userLabel={props.auth?.userLabel}
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
                  <div>Selected rule: {selectedRuleId ?? 'none'}</div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(governance.policySetId);
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Copy size={14} />
                      Copy policy set id
                    </span>
                  </Button>
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
                {selectedRuleId && <div>Authority row focus: {selectedRuleId}</div>}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <PanelTitle title="Policy rules" subtitle="Precedence and obligations are explicit, not hidden." />
              <Button variant="secondary" size="sm" onClick={() => setRuleFilter('all')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={14} />
                  Clear filter
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <Button size="sm" variant={ruleFilter === 'all' ? 'primary' : 'secondary'} onClick={() => setRuleFilter('all')}>All</Button>
              <Button size="sm" variant={ruleFilter === 'allow' ? 'primary' : 'secondary'} onClick={() => setRuleFilter('allow')}>Allow</Button>
              <Button size="sm" variant={ruleFilter === 'deny' ? 'primary' : 'secondary'} onClick={() => setRuleFilter('deny')}>Deny</Button>
              <Button size="sm" variant={ruleFilter === 'hold' ? 'primary' : 'secondary'} onClick={() => setRuleFilter('hold')}>Hold</Button>
            </div>
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
                    <button
                      type="button"
                      key={row.dimension}
                      onClick={() => setSelectedRuleId(row.dimension)}
                      style={{ display: 'grid', gap: 6, padding: 14, borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <strong>{row.dimension}</strong>
                        <Badge tone="muted">{row.roles.length} roles</Badge>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{row.description}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{row.roles.join(', ')}</div>
                    </button>
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
