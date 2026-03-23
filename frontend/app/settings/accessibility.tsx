import { Redirect } from 'expo-router';
import { AppFrame } from '../../src/components/app-frame';
import { AccessibilitySettingsScreen } from '../../src/features/settings/settings-screens';
import { useSession } from '../../src/providers/session-provider';

export default function AccessibilityRoute() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <AppFrame title="Accessibility" subtitle="User overrides on top of the tenant baseline.">
      <AccessibilitySettingsScreen />
    </AppFrame>
  );
}
