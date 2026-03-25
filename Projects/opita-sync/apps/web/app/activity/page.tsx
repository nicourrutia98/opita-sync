import { Suspense } from 'react';
import { ActivityPage } from '../../src/routes/activity-page.js';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ActivityPage />
    </Suspense>
  );
}
