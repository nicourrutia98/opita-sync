import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { SettingsPage } from '../../src/routes/settings-page';

export default async function Page() {
  const auth = await requireServerAuth('/settings');
  return (
    <Suspense fallback={null}>
      <SettingsPage auth={{ tenantName: auth.user.tenantId, userLabel: auth.user.displayName }} />
    </Suspense>
  );
}
