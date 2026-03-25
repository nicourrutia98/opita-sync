import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { DashboardPage } from '../../src/routes/dashboard-page';

export default async function Page() {
  const auth = await requireServerAuth('/dashboard');

  return (
    <Suspense fallback={null}>
      <DashboardPage
        auth={{
          tenantId: auth.user.tenantId,
          displayName: auth.user.displayName,
          email: auth.user.email,
          roles: auth.user.roles,
          expiresAt: auth.session.expiresAt
        }}
      />
    </Suspense>
  );
}
