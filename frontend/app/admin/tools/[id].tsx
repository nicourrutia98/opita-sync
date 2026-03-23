import { Redirect, useLocalSearchParams } from 'expo-router';
import { AppFrame } from '../../../src/components/app-frame';
import { ToolDetailScreen } from '../../../src/features/admin/tools-screen';
import { useSession } from '../../../src/providers/session-provider';

export default function ToolDetailRoute() {
  const { session } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Tool detail" subtitle="Certification posture, runtime metadata and safe transitions.">
      <ToolDetailScreen toolId={id} />
    </AppFrame>
  );
}
