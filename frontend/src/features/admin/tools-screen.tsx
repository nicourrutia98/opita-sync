import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { api } from '../../lib/api';
import { useSession } from '../../providers/session-provider';
import { colors, spacing } from '../../theme/tokens';
import { AppText, Button, Card, Field, Pill, uiStyles } from '../../components/ui';

export function ToolsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [toolCode, setToolCode] = useState('');
  const [capabilityCode, setCapabilityCode] = useState('status_query');
  const [toolType, setToolType] = useState('generic_tool');

  const toolsQuery = useQuery({
    queryKey: ['tools', session?.accessToken],
    queryFn: () => api.listTools(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createTool(session!.accessToken, {
        toolCode,
        toolVersion: 'v1',
        capabilityCode,
        toolType,
        riskLevel: capabilityCode === 'request_create' ? 'WRITE_WITH_CONFIRMATION' : 'READ_ONLY',
        executionMode:
          capabilityCode === 'request_create' ? 'CONFIRM_THEN_EXECUTE' : 'SUGGEST',
        certificationStatus: 'DRAFT',
        tenantScopeMode: 'TENANT',
        permissionsRequiredJson:
          capabilityCode === 'request_create' ? ['case.create'] : ['case.read'],
        requiresProvider: false,
        rollbackStrategy: 'replace_with_previous_production_version',
        inputContractRef: `${toolCode || 'tool'}.input`,
        outputContractRef: `${toolCode || 'tool'}.output`,
      }),
    onSuccess: async () => {
      setToolCode('');
      await queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  return (
    <View style={styles.root}>
      <Card style={styles.formCard}>
        <AppText style={styles.title}>Tool registry</AppText>
        <Field label="Tool code" value={toolCode} onChangeText={setToolCode} />
        <Field
          label="Capability code"
          value={capabilityCode}
          onChangeText={setCapabilityCode}
        />
        <Field label="Tool type" value={toolType} onChangeText={setToolType} />
        <Button
          label={createMutation.isPending ? 'Creando…' : 'Crear draft'}
          onPress={() => createMutation.mutate()}
          disabled={!toolCode.trim()}
        />
      </Card>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ gap: spacing.sm }}>
          {toolsQuery.data?.map((tool) => (
            <Pressable key={tool.id} onPress={() => router.push(`/admin/tools/${tool.id}`)}>
              <Card>
                <View style={uiStyles.row}>
                  <Pill label={tool.toolCode} tone="primary" />
                  <Pill label={tool.certificationStatus} />
                  <Pill label={tool.executionMode} />
                </View>
                <AppText style={{ fontWeight: '700' }}>{tool.capabilityCode}</AppText>
                <AppText muted>
                  {tool.toolVersion} · {tool.riskLevel}
                </AppText>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function ToolDetailScreen({ toolId }: { toolId: string }) {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const toolsQuery = useQuery({
    queryKey: ['tools', session?.accessToken],
    queryFn: () => api.listTools(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
  const tool = toolsQuery.data?.find((item) => item.id === toolId);

  const transitionMutation = useMutation({
    mutationFn: (action: string) => api.transitionTool(session!.accessToken, toolId, action),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  if (!tool) {
    return (
      <Card>
        <AppText>Tool no encontrada.</AppText>
      </Card>
    );
  }

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={uiStyles.row}>
        <Pill label={tool.toolCode} tone="primary" />
        <Pill label={tool.toolVersion} />
        <Pill label={tool.certificationStatus} />
      </View>
      <AppText style={styles.title}>{tool.capabilityCode}</AppText>
      <AppText muted>{tool.toolType}</AppText>
      <Card style={{ backgroundColor: colors.surfaceMuted }}>
        <AppText muted mono>
          {JSON.stringify(tool, null, 2)}
        </AppText>
      </Card>
      <View style={uiStyles.row}>
        <Button label="Review" variant="secondary" onPress={() => transitionMutation.mutate('review')} />
        <Button label="Certify" variant="secondary" onPress={() => transitionMutation.mutate('certify')} />
        <Button label="Promote" onPress={() => transitionMutation.mutate('promote')} />
        <Button label="Deprecate" variant="danger" onPress={() => transitionMutation.mutate('deprecate')} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: spacing.lg,
  },
  formCard: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
});
