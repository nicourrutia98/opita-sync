import { Redirect, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppFrame } from '../../../src/components/app-frame';
import { AppText, Card, Pill, Screen } from '../../../src/components/ui';
import { api } from '../../../src/lib/api';
import { useSession } from '../../../src/providers/session-provider';

export default function CaseDetailRoute() {
  const { session } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['case', id, session?.accessToken],
    queryFn: () => api.getCase(session!.accessToken, id),
    enabled: Boolean(session?.accessToken && id),
  });

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return (
    <AppFrame title="Case detail" subtitle="Structured case context around the main chat workflow.">
      <Screen scroll>
        <Card>
          <Pill label={query.data?.caseCode ?? 'Case'} tone="primary" />
          <AppText style={{ fontSize: 24, fontWeight: '800' }}>
            {query.data?.caseType ?? 'Loading case'}
          </AppText>
          <AppText muted>{query.data?.statusCode}</AppText>
          <AppText muted mono>
            {JSON.stringify(query.data?.contexts ?? [], null, 2)}
          </AppText>
        </Card>
      </Screen>
    </AppFrame>
  );
}
