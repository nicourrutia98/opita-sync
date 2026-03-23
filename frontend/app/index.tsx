import { Redirect } from 'expo-router';
import { useSession } from '../src/providers/session-provider';

export default function IndexScreen() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return <Redirect href="/workspace/current" />;
}
