import { Redirect } from 'expo-router';
import { AppFrame } from '../../../src/components/app-frame';
import { TenantMembersScreen } from '../../../src/features/settings/settings-screens';
import { useSession } from '../../../src/providers/session-provider';

export default function TenantMembersRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Tenant members" subtitle="Invitations and current membership under tenant governance.">
      <TenantMembersScreen />
    </AppFrame>
  );
}
