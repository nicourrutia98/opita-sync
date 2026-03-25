import { Suspense } from 'react';
import { redirectAuthenticatedUser } from '../../src/lib/auth-server';
import { LoginPage } from '../../src/routes/login-page';

export default async function Page() {
  await redirectAuthenticatedUser();

  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
