import { Suspense } from 'react';
import { OperatePage } from '../../src/routes/operate-page.js';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OperatePage />
    </Suspense>
  );
}
