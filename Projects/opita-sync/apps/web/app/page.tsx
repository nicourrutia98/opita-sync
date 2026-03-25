import { redirect } from 'next/navigation';
import { getServerAuthSession } from '../src/lib/auth-server';

export default async function HomePage() {
  const session = await getServerAuthSession();
  redirect(session ? '/dashboard' : '/login');
}

