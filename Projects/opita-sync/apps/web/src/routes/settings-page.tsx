'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter } from 'next/navigation';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, MetricCard, StateBlock, Textarea } from '../../../../packages/ui-core/src/primitives.js';
import { fetchSettings } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import { settingsSchema, type SettingsFormValues } from '../lib/schemas.js';

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

const STORAGE_KEY = 'opita-settings-form';

function loadLocalValues(defaults: SettingsFormValues): SettingsFormValues {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SettingsFormValues>;
    return { ...defaults, ...parsed } as SettingsFormValues;
  } catch {
    return defaults;
  }
}

export function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings
  });
  const backend = settingsQuery.data;

  const defaults = useMemo<SettingsFormValues>(
    () => ({
      tenantId: backend?.tenantId ?? 'tenant_1',
      tenantName: backend?.tenantName ?? 'Tenant 1',
      defaultEnvironment: backend?.environments[0] ?? 'dev',
      preferredProvider: backend?.activeProviders[0] ?? 'OpenAI',
      connectorNotes: 'High-trust connectors remain centrally governed.'
    }),
    [backend]
  );

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaults
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      form.reset(loadLocalValues(defaults));
    }
  }, [defaults, form]);

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  return (
    <AppShellLayout
      area="settings"
      title="Settings"
      subtitle="Solo plumbing y configuración técnica/tenant. No debe convertirse en consola de autoridad."
      summary={backend?.tenantId ?? 'not_loaded'}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      inspector={
        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardContent>
              <PanelTitle title="Backend plumbing" subtitle="Read-only view of current backend environment." />
              {backend ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 14, color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
                  <div>Tenant: {backend.tenantName}</div>
                  <div>Providers: {backend.activeProviders.join(', ')}</div>
                  <div>Environments: {backend.environments.join(', ')}</div>
                </div>
              ) : (
                <StateBlock tone="empty" title="No backend settings" description="Load the settings view model to inspect providers and connectors." />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <PanelTitle title="Governance boundary" subtitle="Settings is plumbing, not policy authority." />
              <div style={{ marginTop: 14, display: 'grid', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                <div>Credentials and connectors stay centrally governed.</div>
                <div>Policy, roles and classification live in Governance.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <MetricCard label="Providers" value={`${backend?.activeProviders.length ?? 0}`} helper="Configured model providers." />
          <MetricCard label="Connectors" value={`${backend?.connectors.length ?? 0}`} helper="Governed connector inventory." />
          <MetricCard label="Environments" value={`${backend?.environments.length ?? 0}`} helper="Tenant environments enabled." />
        </div>

        {savedMessage && <StateBlock tone="success" title="Saved locally" description={savedMessage} />}

        <Card>
          <CardHeader>
            <PanelTitle title="Tenant plumbing" subtitle="Persisted locally for v1 until backend settings persistence lands." />
          </CardHeader>
          <CardContent>
            <form
              style={{ display: 'grid', gap: 14 }}
              onSubmit={form.handleSubmit((values) => {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
                setSavedMessage(`Saved preferences for ${values.tenantName} (${values.defaultEnvironment}).`);
              })}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Tenant id</div>
                  <Input {...form.register('tenantId')} />
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Tenant name</div>
                  <Input {...form.register('tenantName')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Default environment</div>
                  <select {...form.register('defaultEnvironment')} style={{ height: 44, borderRadius: 16, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', padding: '0 14px' }}>
                    <option value="dev">dev</option>
                    <option value="staging">staging</option>
                    <option value="prod">prod</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Preferred provider</div>
                  <select {...form.register('preferredProvider')} style={{ height: 44, borderRadius: 16, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', padding: '0 14px' }}>
                    {(backend?.activeProviders ?? ['OpenAI', 'Anthropic', 'Gemini']).map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Connector notes</div>
                <Textarea rows={4} {...form.register('connectorNotes')} />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button type="submit">Save local settings</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset(defaults);
                    setSavedMessage('Restored backend-backed defaults.');
                  }}
                >
                  Restore defaults
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <PanelTitle title="Connector and credential surface" subtitle="Only plumbing belongs here; governance remains elsewhere." />
          </CardHeader>
          <CardContent>
            {backend ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {backend.connectors.map((connector) => (
                  <div key={connector.connectorId} style={{ display: 'grid', gap: 8, padding: 14, borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{connector.name}</strong>
                      <Badge tone={connector.status === 'active' ? 'success' : 'warning'}>{connector.status}</Badge>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                      Owner: {connector.owner} · {connector.connectorId}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StateBlock tone="empty" title="No connector data" description="Connectors and credentials will appear once settings endpoint responds." />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShellLayout>
  );
}
