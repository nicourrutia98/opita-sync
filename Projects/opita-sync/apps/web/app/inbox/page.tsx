import { Suspense } from 'react';
import { InboxPage } from '../../src/routes/inbox-page.js';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InboxPage />
    </Suspense>
  );
}
