import { Suspense } from 'react';
import { requireServerAuth } from '../../src/lib/auth-server';
import { CatalogPage } from '../../src/routes/catalog-page';

export default async function Page() {
  const auth = await requireServerAuth('/catalog');
  return (
    <Suspense fallback={null}>
      <CatalogPage auth={{ tenantName: auth.user.tenantId, userLabel: auth.user.displayName }} />
    </Suspense>
  );
}
