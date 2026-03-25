import { Suspense } from 'react';
import { CatalogPage } from '../../src/routes/catalog-page.js';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CatalogPage />
    </Suspense>
  );
}
