import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { GovernancePage } from '../../src/routes/governance-page';

export default async function Page() {
  const auth = await requireServerAuth('/governance');
  return (
    <Suspense fallback={null}>
      <GovernancePage auth={{ tenantName: auth.user.tenantId, userLabel: auth.user.displayName }} />
    </Suspense>
  );
}
