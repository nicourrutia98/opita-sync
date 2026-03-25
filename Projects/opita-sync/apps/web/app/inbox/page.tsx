import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { InboxPage } from '../../src/routes/inbox-page';

export default async function Page() {
  const auth = await requireServerAuth('/inbox');
  return (
    <Suspense fallback={null}>
      <InboxPage auth={{ tenantName: auth.user.tenantId, userLabel: auth.user.displayName }} />
    </Suspense>
  );
}
