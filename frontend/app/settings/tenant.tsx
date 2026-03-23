import { Redirect } from 'expo-router';
import { AppFrame } from '../../src/components/app-frame';
import { TenantSettingsScreen } from '../../src/features/settings/settings-screens';
import { useSession } from '../../src/providers/session-provider';

export default function TenantSettingsRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Tenant settings" subtitle="Branding and baseline defaults constrained by accessibility rules.">
      <TenantSettingsScreen />
    </AppFrame>
  );
}
