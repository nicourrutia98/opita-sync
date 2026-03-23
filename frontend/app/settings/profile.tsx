import { Redirect } from 'expo-router';
import { AppFrame } from '../../src/components/app-frame';
import { ProfileSettingsScreen } from '../../src/features/settings/settings-screens';
import { useSession } from '../../src/providers/session-provider';

export default function ProfileRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Profile settings" subtitle="User-level UI and locale preferences.">
      <ProfileSettingsScreen />
    </AppFrame>
  );
}
