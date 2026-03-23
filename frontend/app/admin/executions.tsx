import { Redirect } from 'expo-router';
import { AppFrame } from '../../src/components/app-frame';
import { ExecutionsScreen } from '../../src/features/admin/operations-screens';
import { useSession } from '../../src/providers/session-provider';

export default function ExecutionsRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Execution audit" subtitle="Tool executions and positive actions linked to governed outcomes.">
      <ExecutionsScreen />
    </AppFrame>
  );
}
