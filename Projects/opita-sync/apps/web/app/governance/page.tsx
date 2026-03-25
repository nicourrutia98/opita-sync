import { Suspense } from 'react';
import { GovernancePage } from '../../src/routes/governance-page.js';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GovernancePage />
    </Suspense>
  );
}
