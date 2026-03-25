import { Suspense } from 'react';
import { SettingsPage } from '../../src/routes/settings-page.js';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
