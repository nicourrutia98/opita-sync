import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { AuthSessionResponse } from './types.js';

const apiBaseUrl = process.env.OPITA_API_BASE_URL ?? 'http://127.0.0.1:4000';

async function fetchSessionFromBackend(): Promise<AuthSessionResponse | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((item) => `${item.name}=${item.value}`).join('; ');

  const response = await fetch(`${apiBaseUrl}/api/auth/session`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthSessionResponse>;
}

export async function getServerAuthSession() {
  return fetchSessionFromBackend();
}

export async function requireServerAuth(nextPath?: string) {
  const session = await fetchSessionFromBackend();
  if (!session) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login');
  }
  return session;
}

export async function redirectAuthenticatedUser() {
  const session = await fetchSessionFromBackend();
  if (session) {
    redirect('/dashboard');
  }
}
