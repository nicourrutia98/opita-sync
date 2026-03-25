'use client';

import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, BookOpenText, Filter, Search } from 'lucide-react';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, MetricCard, StateBlock } from '../../../../packages/ui-core/src/primitives.js';
import { DenseTable } from '../../../../packages/ui-core/src/table.js';
import { fetchCatalog } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import type { CatalogItemSummary } from '../lib/types.js';

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

const columnHelper = createColumnHelper<CatalogItemSummary>();

export function CatalogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [kindFilter, setKindFilter] = useState<'all' | 'action' | 'workflow'>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<'all' | 'published' | 'draft' | 'retired'>('all');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'auto' | 'pre-execution' | 'pre-application' | 'double_approval'>('all');
  const [selected, setSelected] = useState<CatalogItemSummary | null>(null);

  const catalogQuery = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: fetchCatalog
  });

  const filtered = useMemo(() => {
    const items = catalogQuery.data?.items ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || `${item.assetId} ${item.name} ${item.description} ${item.kind} ${item.classificationTags.join(' ')}`.toLowerCase().includes(q);
      const matchesKind = kindFilter === 'all' || item.kind === kindFilter;
      const matchesLifecycle = lifecycleFilter === 'all' || item.lifecycleState === lifecycleFilter;
      const matchesApproval = approvalFilter === 'all' || item.approvalMode === approvalFilter;
      return matchesSearch && matchesKind && matchesLifecycle && matchesApproval;
    });
  }, [approvalFilter, catalogQuery.data?.items, kindFilter, lifecycleFilter, search]);

  const table = useReactTable({
    data: filtered,
    columns: [
      columnHelper.accessor('name', {
        header: 'Asset',
        cell: (info) => (
          <div style={{ display: 'grid', gap: 4 }}>
            <strong>{info.row.original.name}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{info.row.original.assetId}</span>
          </div>
        )
      }),
      columnHelper.accessor('kind', { header: 'Kind', cell: (info) => <Badge tone="muted">{info.getValue()}</Badge> }),
      columnHelper.accessor('lifecycleState', { header: 'Lifecycle', cell: (info) => <Badge tone={info.getValue() === 'published' ? 'success' : 'warning'}>{info.getValue()}</Badge> }),
      columnHelper.accessor('approvalMode', { header: 'Approval', cell: (info) => <Badge tone="brand">{info.getValue()}</Badge> }),
      columnHelper.display({
        id: 'actions',
        header: 'Open',
        cell: (info) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              router.push(`/operate?assetId=${encodeURIComponent(info.row.original.assetId)}`);
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={16} />
              Operate
            </span>
          </Button>
        )
      })
    ],
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <AppShellLayout
      area="catalog"
      title="Catalog"
      subtitle="Inventario aprobado de acciones y workflows. La publicación y el riesgo siguen visibles antes del lanzamiento a Operate."
      summary={`${filtered.length} assets`}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      inspector={
        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardContent>
              <PanelTitle title="Asset selected" subtitle="Detalle rápido del asset elegido." />
              {selected ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 14, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div><strong style={{ color: 'var(--ink)' }}>{selected.name}</strong></div>
                  <div>{selected.description}</div>
                  <div>Classification tags: {selected.classificationTags.join(', ')}</div>
                  <div>Connectors: {selected.connectorIds.join(', ')}</div>
                </div>
              ) : (
                <StateBlock tone="empty" title="Ningún asset seleccionado" description="Elige una fila para ver sus metadatos, publicación y approval mode." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <PanelTitle title="Catalog rules" subtitle="Catalog siempre abre hacia Operate." />
              <div style={{ marginTop: 14, display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                <div>Published semantics are immutable.</div>
                <div>Breaking changes create new asset identities.</div>
                <div>Connectors remain centrally governed.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          <MetricCard label="Assets" value={`${catalogQuery.data?.items.length ?? 0}`} helper="Approved inventory available to launch." />
          <MetricCard label="Published" value={`${catalogQuery.data?.items.filter((item) => item.lifecycleState === 'published').length ?? 0}`} helper="Active published assets." />
          <MetricCard label="Actions" value={`${catalogQuery.data?.items.filter((item) => item.kind === 'action').length ?? 0}`} helper="Action assets in catalog." />
          <MetricCard label="Workflows" value={`${catalogQuery.data?.items.filter((item) => item.kind === 'workflow').length ?? 0}`} helper="Workflow assets in catalog." />
        </div>

        <Card>
          <CardHeader>
            <PanelTitle title="Search and launch" subtitle="Catalog does not bypass Operate." />
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }} />
                  <Input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search assets, tags, connectors, approval mode..." style={{ paddingLeft: 40 }} />
                </div>
                <Button variant="secondary" onClick={() => setFiltersOpen((current) => !current)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={16} />
                    {filtersOpen ? 'Hide filters' : 'Filters'}
                  </span>
                </Button>
              </div>

              {filtersOpen && (
                <div style={{ display: 'grid', gap: 12, padding: 14, border: '1px solid var(--line)', borderRadius: 18, background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button size="sm" variant={kindFilter === 'all' ? 'primary' : 'secondary'} onClick={() => setKindFilter('all')}>All kinds</Button>
                    <Button size="sm" variant={kindFilter === 'action' ? 'primary' : 'secondary'} onClick={() => setKindFilter('action')}>Actions</Button>
                    <Button size="sm" variant={kindFilter === 'workflow' ? 'primary' : 'secondary'} onClick={() => setKindFilter('workflow')}>Workflows</Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button size="sm" variant={lifecycleFilter === 'all' ? 'primary' : 'secondary'} onClick={() => setLifecycleFilter('all')}>Any lifecycle</Button>
                    <Button size="sm" variant={lifecycleFilter === 'published' ? 'primary' : 'secondary'} onClick={() => setLifecycleFilter('published')}>Published</Button>
                    <Button size="sm" variant={lifecycleFilter === 'draft' ? 'primary' : 'secondary'} onClick={() => setLifecycleFilter('draft')}>Draft</Button>
                    <Button size="sm" variant={lifecycleFilter === 'retired' ? 'primary' : 'secondary'} onClick={() => setLifecycleFilter('retired')}>Retired</Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button size="sm" variant={approvalFilter === 'all' ? 'primary' : 'secondary'} onClick={() => setApprovalFilter('all')}>Any approval</Button>
                    <Button size="sm" variant={approvalFilter === 'auto' ? 'primary' : 'secondary'} onClick={() => setApprovalFilter('auto')}>Auto</Button>
                    <Button size="sm" variant={approvalFilter === 'pre-execution' ? 'primary' : 'secondary'} onClick={() => setApprovalFilter('pre-execution')}>Pre-execution</Button>
                    <Button size="sm" variant={approvalFilter === 'pre-application' ? 'primary' : 'secondary'} onClick={() => setApprovalFilter('pre-application')}>Pre-application</Button>
                    <Button size="sm" variant={approvalFilter === 'double_approval' ? 'primary' : 'secondary'} onClick={() => setApprovalFilter('double_approval')}>Double approval</Button>
                  </div>
                </div>
              )}

              <DenseTable
                table={table}
                emptyLabel="No published assets match this filter."
                onRowClick={(row) => {
                  setSelected(row);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShellLayout>
  );
}
