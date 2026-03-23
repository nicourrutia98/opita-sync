import { Redirect } from 'expo-router';
import { AppFrame } from '../../src/components/app-frame';
import { WorkspaceScreen } from '../../src/features/workspace/workspace-screen';
import { useSession } from '../../src/providers/session-provider';

export default function CurrentWorkspaceRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }

  return (
    <AppFrame
      title="Workspace"
      subtitle="Chat-first, tool-governed execution, low-noise layout."
    >
      <WorkspaceScreen />
    </AppFrame>
  );
}
