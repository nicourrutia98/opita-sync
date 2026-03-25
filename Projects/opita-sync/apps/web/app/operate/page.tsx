import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { OperatePage } from '../../src/routes/operate-page';

export default async function Page() {
  const auth = await requireServerAuth('/operate');
  return (
    <Suspense fallback={null}>
      <OperatePage auth={{ tenantName: auth.user.tenantId, userLabel: auth.user.displayName }} />
    </Suspense>
  );
}
