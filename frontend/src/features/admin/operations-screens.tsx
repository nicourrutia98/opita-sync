import { useMutation, useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useSession } from '../../providers/session-provider';
import { spacing } from '../../theme/tokens';
import { AppText, Button, Card, Field, Pill, uiStyles } from '../../components/ui';

export function ConfirmationsScreen() {
  const { session } = useSession();
  const [codes, setCodes] = useState<Record<string, string>>({});
  const query = useQuery({
    queryKey: ['confirmation-requests', session?.accessToken],
    queryFn: () => api.listConfirmationRequests(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const confirmMutation = useMutation({
    mutationFn: (input: { id: string; code?: string }) =>
      api.confirmConfirmationRequest(session!.accessToken, input.id, input.code),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectConfirmationRequest(session!.accessToken, id),
  });

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ gap: spacing.sm }}>
        {query.data?.map((item) => (
          <Card key={item.id}>
            <View style={uiStyles.row}>
              <Pill label={item.status} />
              <AppText muted>{item.toolCode}</AppText>
            </View>
            <AppText style={{ fontWeight: '700' }}>{item.capabilityCode}</AppText>
            <Field
              label="Confirmation code"
              value={codes[item.id] ?? ''}
              onChangeText={(value) =>
                setCodes((current) => ({ ...current, [item.id]: value }))
              }
            />
            <View style={uiStyles.row}>
              <Button
                label="Confirm"
                onPress={() =>
                  confirmMutation.mutate({ id: item.id, code: codes[item.id] })
                }
              />
              <Button
                label="Reject"
                variant="danger"
                onPress={() => rejectMutation.mutate(item.id)}
              />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

export function ExecutionsScreen() {
  const { session } = useSession();
  const executionQuery = useQuery({
    queryKey: ['tool-executions', session?.accessToken],
    queryFn: () => api.listToolExecutions(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
  const positiveQuery = useQuery({
    queryKey: ['positive-actions', session?.accessToken],
    queryFn: () => api.listPositiveActions(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ gap: spacing.lg }}>
        <Card>
          <AppText style={styles.title}>Execution audit</AppText>
          <View style={{ gap: spacing.sm }}>
            {executionQuery.data?.map((item) => (
              <Card key={item.id}>
                <View style={uiStyles.row}>
                  <Pill label={item.executionResult} />
                  <AppText muted>{item.toolCode}</AppText>
                </View>
                <AppText style={{ fontWeight: '700' }}>{item.capabilityCode}</AppText>
                <AppText muted>{item.createdAt}</AppText>
              </Card>
            ))}
          </View>
        </Card>

        <Card>
          <AppText style={styles.title}>Positive actions</AppText>
          <View style={{ gap: spacing.sm }}>
            {positiveQuery.data?.map((item) => (
              <Card key={item.id}>
                <View style={uiStyles.row}>
                  <Pill label={item.toolCode} tone="success" />
                  <AppText muted>{item.createdAt}</AppText>
                </View>
                <AppText style={{ fontWeight: '700' }}>{item.capabilityCode}</AppText>
                <AppText muted>Execution attempt: {item.executionAttemptId}</AppText>
              </Card>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
});
