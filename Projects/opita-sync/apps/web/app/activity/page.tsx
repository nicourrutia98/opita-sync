import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { ActivityPage } from '../../src/routes/activity-page';

export default async function Page() {
  const auth = await requireServerAuth('/activity');
  return (
    <Suspense fallback={null}>
      <ActivityPage auth={{ tenantName: auth.user.tenantId, userLabel: auth.user.displayName }} />
    </Suspense>
  );
}
