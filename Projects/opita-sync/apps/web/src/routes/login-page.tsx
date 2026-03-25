'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, StateBlock } from '../../../../packages/ui-core/src/primitives.js';
import { login } from '../lib/api.js';

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <CardTitle>{title}</CardTitle>
      {subtitle && <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('test@test-tenant.local');
  const [password, setPassword] = useState('test123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: () => {
      const next = searchParams.get('next');
      router.replace(next || '/dashboard');
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'login_failed');
    }
  });

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #f4f5f7 0%, #e8ebef 100%)', padding: 24 }}>
      <div style={{ width: 'min(920px, 100%)', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(340px, 0.9fr)', gap: 20 }}>
        <Card style={{ background: '#0f1720', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent>
            <div style={{ display: 'grid', gap: 18, padding: 8 }}>
              <Badge tone="muted">Sobrio • Local auth • test-tenant</Badge>
              <div style={{ display: 'grid', gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.05 }}>Login primero. Workspace después.</h1>
                <p style={{ margin: 0, color: 'rgba(248,250,252,0.74)', fontSize: 15, lineHeight: 1.6 }}>
                  Esta versión entra siempre por autenticación y protege Operate, Catalog, Inbox, Activity, Governance y Settings antes de exponer el tenant.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 10, color: 'rgba(248,250,252,0.72)', fontSize: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ShieldCheck size={18} />
                  <span>Sesión local por cookie HttpOnly</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <LockKeyhole size={18} />
                  <span>Tenant seed listo para pruebas rápidas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <PanelTitle title="Sign in" subtitle="Accede con el usuario seed local de test-tenant." />
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage(null);
                loginMutation.mutate();
              }}
              style={{ display: 'grid', gap: 14 }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Email</div>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Password</div>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </div>
              {errorMessage && <StateBlock tone="error" title="Login failed" description={errorMessage} />}
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in…' : 'Enter dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
