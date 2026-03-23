import { Redirect } from 'expo-router';
import { AppFrame } from '../../../src/components/app-frame';
import { ToolsScreen } from '../../../src/features/admin/tools-screen';
import { useSession } from '../../../src/providers/session-provider';

export default function ToolsRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Tool registry" subtitle="Draft, certification, promotion and deprecation in one governed surface.">
      <ToolsScreen />
    </AppFrame>
  );
}
