import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { api } from '../../lib/api';
import type { CaseRecord, Conversation, ConversationMessage, OrchestratorResponse } from '../../lib/types';
import { useSession } from '../../providers/session-provider';
import { colors, radii, spacing } from '../../theme/tokens';
import { AppText, Button, Card, Field, Pill, uiStyles } from '../../components/ui';

function buildSystemMessage(result: OrchestratorResponse) {
  if (result.executionResult === 'SUCCESS') {
    return {
      contentText:
        result.capabilityCode === 'status_query'
          ? 'Consulta resuelta correctamente.'
          : 'Solicitud registrada correctamente.',
      contentStructuredJson: result,
    };
  }
  if (result.executionResult === 'REQUIRES_CONFIRMATION') {
    return {
      contentText: 'La acción requiere confirmación antes de ejecutar.',
      contentStructuredJson: result,
    };
  }
  return {
    contentText: result.blockedReason || 'La ejecución quedó bloqueada.',
    contentStructuredJson: result,
  };
}

export function WorkspaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const isNarrow = width < 1080;

  const [draft, setDraft] = useState('');
  const [capabilityCode, setCapabilityCode] = useState<'status_query' | 'request_create'>(
    'status_query',
  );
  const [requestCaseType, setRequestCaseType] = useState('maintenance_request');
  const [requestPriority, setRequestPriority] = useState('medium');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [confirmationState, setConfirmationState] = useState<OrchestratorResponse | null>(null);
  const [rightRailOpen, setRightRailOpen] = useState(!isNarrow);

  useEffect(() => {
    setRightRailOpen(!isNarrow);
  }, [isNarrow]);

  const conversationsQuery = useQuery({
    queryKey: ['conversations', session?.accessToken],
    queryFn: () => api.listConversations(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const casesQuery = useQuery({
    queryKey: ['cases', session?.accessToken],
    queryFn: () => api.listCases(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const activeConversationId = params.id ?? conversationsQuery.data?.[0]?.id ?? null;

  const conversationQuery = useQuery({
    queryKey: ['conversation', activeConversationId, session?.accessToken],
    queryFn: () => api.getConversation(session!.accessToken, activeConversationId!),
    enabled: Boolean(session?.accessToken && activeConversationId),
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', activeConversationId, session?.accessToken],
    queryFn: () => api.listMessages(session!.accessToken, activeConversationId!),
    enabled: Boolean(session?.accessToken && activeConversationId),
  });

  const selectedCase = useMemo(
    () =>
      casesQuery.data?.find((item) => item.id === selectedCaseId) ??
      casesQuery.data?.find((item) => item.id === conversationQuery.data?.activeCaseId) ??
      null,
    [casesQuery.data, conversationQuery.data?.activeCaseId, selectedCaseId],
  );

  const createConversationMutation = useMutation({
    mutationFn: async () => api.createConversation(session!.accessToken, 'Nueva conversación'),
    onSuccess: async (conversation) => {
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      router.replace(`/workspace/conversations/${conversation.id}`);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      let conversation: Conversation;
      if (!activeConversationId) {
        conversation = await api.createConversation(session!.accessToken, draft.slice(0, 40));
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        router.replace(`/workspace/conversations/${conversation.id}`);
      } else {
        conversation =
          conversationQuery.data ??
          (await api.getConversation(session!.accessToken, activeConversationId));
      }

      await api.appendMessage(session!.accessToken, conversation.id, {
        senderType: 'USER',
        contentText: draft,
      });

      const orchestratorResult = await api.executeOrchestrator(session!.accessToken, {
        conversationId: conversation.id,
        capabilityCode,
        currentUserRequest: draft,
        caseId:
          capabilityCode === 'status_query'
            ? selectedCaseId || conversation.activeCaseId || undefined
            : undefined,
        caseType: capabilityCode === 'request_create' ? requestCaseType : undefined,
        priorityCode: capabilityCode === 'request_create' ? requestPriority : undefined,
        structuredFields:
          capabilityCode === 'request_create'
            ? { caseType: requestCaseType, priorityCode: requestPriority }
            : undefined,
      });

      const systemMessage = buildSystemMessage(orchestratorResult);
      await api.appendMessage(session!.accessToken, conversation.id, {
        senderType: 'SYSTEM',
        contentText: systemMessage.contentText,
        contentStructuredJson: systemMessage.contentStructuredJson ?? undefined,
      });

      return { orchestratorResult };
    },
    onSuccess: async ({ orchestratorResult }) => {
      setDraft('');
      setConfirmationState(
        orchestratorResult.executionResult === 'REQUIRES_CONFIRMATION'
          ? orchestratorResult
          : null,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['messages'] }),
        queryClient.invalidateQueries({ queryKey: ['cases'] }),
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
      ]);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!confirmationState?.confirmationId) {
        throw new Error('No pending confirmation');
      }
      const result = await api.confirmOrchestrator(
        session!.accessToken,
        confirmationState.confirmationId,
        confirmationState.confirmationCode ?? undefined,
      );
      if (activeConversationId) {
        await api.appendMessage(session!.accessToken, activeConversationId, {
          senderType: 'SYSTEM',
          contentText: 'La acción fue confirmada y ejecutada correctamente.',
          contentStructuredJson: result.payload ?? undefined,
        });
      }
      return result;
    },
    onSuccess: async () => {
      setConfirmationState(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['messages'] }),
        queryClient.invalidateQueries({ queryKey: ['cases'] }),
        queryClient.invalidateQueries({ queryKey: ['positive-actions'] }),
        queryClient.invalidateQueries({ queryKey: ['tool-executions'] }),
      ]);
    },
  });

  return (
    <View style={[styles.root, isNarrow && styles.rootNarrow]}>
      <Card style={[styles.leftRail, isNarrow && styles.leftRailNarrow]}>
        <View style={uiStyles.row}>
          <AppText style={styles.railTitle}>Conversaciones</AppText>
          <Button
            label="Nueva"
            variant="secondary"
            onPress={() => createConversationMutation.mutate()}
          />
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ gap: spacing.sm }}>
            {conversationsQuery.data?.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/workspace/conversations/${item.id}`)}
                style={[
                  styles.railItem,
                  activeConversationId === item.id && styles.railItemActive,
                ]}
              >
                <AppText style={{ fontWeight: '700' }}>{item.title || 'Sin título'}</AppText>
                <AppText muted>{item.status}</AppText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Card>

      <Card style={styles.threadPanel}>
        <View style={styles.threadHeader}>
          <View style={{ gap: 4 }}>
            <AppText style={styles.threadTitle}>Workspace actual</AppText>
            <AppText muted>El chat es la fuente principal de información.</AppText>
          </View>
          <Button
            label={rightRailOpen ? 'Ocultar contexto' : 'Mostrar contexto'}
            variant="ghost"
            onPress={() => setRightRailOpen((current) => !current)}
          />
        </View>

        <View style={styles.capabilityBar}>
          <Pressable
            style={[
              styles.capabilityChip,
              capabilityCode === 'status_query' && styles.capabilityChipActive,
            ]}
            onPress={() => setCapabilityCode('status_query')}
          >
            <AppText style={styles.capabilityChipText}>Status query</AppText>
          </Pressable>
          <Pressable
            style={[
              styles.capabilityChip,
              capabilityCode === 'request_create' && styles.capabilityChipActive,
            ]}
            onPress={() => setCapabilityCode('request_create')}
          >
            <AppText style={styles.capabilityChipText}>Request create</AppText>
          </Pressable>
        </View>

        {capabilityCode === 'request_create' ? (
          <View style={uiStyles.stretchRow}>
            <View style={{ flex: 1 }}>
              <Field label="Case type" value={requestCaseType} onChangeText={setRequestCaseType} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Priority" value={requestPriority} onChangeText={setRequestPriority} />
            </View>
          </View>
        ) : (
          <Field
            label="Case id visible"
            value={selectedCaseId}
            onChangeText={setSelectedCaseId}
            placeholder="Selecciona o pega un caseId"
          />
        )}

        <ScrollView style={styles.threadScroll}>
          <View style={{ gap: spacing.sm }}>
            {messagesQuery.data?.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {!messagesQuery.data?.length ? (
              <Card style={styles.emptyState}>
                <AppText style={{ fontWeight: '700' }}>Todavía no hay mensajes</AppText>
                <AppText muted>
                  Usa el composer para consultar un caso o pedir la creación de una solicitud.
                </AppText>
              </Card>
            ) : null}
          </View>
        </ScrollView>

        <View style={{ gap: spacing.sm }}>
          {confirmationState ? (
            <Card style={styles.confirmationCard}>
              <View style={uiStyles.row}>
                <Pill label="Confirmación requerida" tone="warning" />
                <AppText muted>
                  {confirmationState.toolCode} · {confirmationState.toolVersion}
                </AppText>
              </View>
              <AppText>
                Vas a ejecutar una acción mutante sobre el sistema. Confirma para continuar.
              </AppText>
              <View style={uiStyles.row}>
                <Button
                  label="Confirmar ejecución"
                  onPress={() => confirmMutation.mutate()}
                  disabled={confirmMutation.isPending}
                />
                <Button
                  label="Mantener pendiente"
                  variant="secondary"
                  onPress={() => setConfirmationState(null)}
                />
              </View>
            </Card>
          ) : null}
          <Field
            label="Composer"
            value={draft}
            onChangeText={setDraft}
            multiline
            placeholder="Escribe una consulta operativa o una nueva solicitud."
          />
          <Button
            label={sendMutation.isPending ? 'Procesando…' : 'Enviar al orquestador'}
            onPress={() => sendMutation.mutate()}
            disabled={!draft.trim() || sendMutation.isPending}
          />
        </View>
      </Card>

      {rightRailOpen ? (
        <Card style={[styles.rightRail, isNarrow && styles.rightRailNarrow]}>
          <AppText style={styles.railTitle}>Contexto</AppText>
          {selectedCase ? <CaseSummary caseRecord={selectedCase} /> : null}
          <Card style={{ backgroundColor: colors.surfaceMuted }}>
            <AppText style={{ fontWeight: '700' }}>Cases visibles</AppText>
            <View style={{ gap: spacing.sm }}>
              {casesQuery.data?.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setSelectedCaseId(item.id);
                    router.push(`/workspace/cases/${item.id}`);
                  }}
                  style={styles.caseRow}
                >
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontWeight: '700' }}>{item.caseCode}</AppText>
                    <AppText muted>{item.statusCode}</AppText>
                  </View>
                  <Pill label={item.priorityCode} />
                </Pressable>
              ))}
            </View>
          </Card>
        </Card>
      ) : null}
    </View>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.senderType === 'USER';
  const structured = (message.contentStructuredJson ?? null) as OrchestratorResponse | null;

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      <Card style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
        <View style={uiStyles.row}>
          <Pill
            label={message.senderType}
            tone={
              isUser
                ? 'primary'
                : structured?.executionResult === 'REQUIRES_CONFIRMATION'
                  ? 'warning'
                  : 'neutral'
            }
          />
          {structured?.toolCode ? (
            <AppText muted>
              {structured.toolCode} · {structured.executionResult}
            </AppText>
          ) : null}
        </View>
        <AppText>{message.contentText}</AppText>
        {structured?.payload ? (
          <Card style={styles.payloadCard}>
            <AppText muted mono>
              {JSON.stringify(structured.payload, null, 2)}
            </AppText>
          </Card>
        ) : null}
      </Card>
    </View>
  );
}

function CaseSummary({ caseRecord }: { caseRecord: CaseRecord }) {
  return (
    <Card style={{ backgroundColor: colors.surfaceMuted }}>
      <View style={uiStyles.row}>
        <Pill label={caseRecord.caseCode} tone="primary" />
        <Pill label={caseRecord.statusCode} />
      </View>
      <AppText style={{ fontWeight: '700' }}>{caseRecord.caseType}</AppText>
      <AppText muted>Prioridad: {caseRecord.priorityCode}</AppText>
      <AppText muted>Requester: {caseRecord.requesterUserId}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rootNarrow: {
    flexDirection: 'column',
  },
  leftRail: {
    width: 250,
    gap: spacing.sm,
  },
  leftRailNarrow: {
    width: '100%',
    maxHeight: 220,
  },
  threadPanel: {
    flex: 1,
    gap: spacing.md,
  },
  rightRail: {
    width: 320,
    gap: spacing.md,
  },
  rightRailNarrow: {
    width: '100%',
  },
  railTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  railItem: {
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    gap: 2,
  },
  railItemActive: {
    backgroundColor: colors.primarySoft,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  threadTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  capabilityBar: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  capabilityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundAlt,
  },
  capabilityChipActive: {
    backgroundColor: colors.primarySoft,
  },
  capabilityChipText: {
    fontWeight: '700',
  },
  threadScroll: {
    flex: 1,
    minHeight: 240,
  },
  messageRow: {
    alignItems: 'flex-start',
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    width: '100%',
    maxWidth: 760,
  },
  messageBubbleUser: {
    backgroundColor: colors.primarySoft,
  },
  payloadCard: {
    backgroundColor: colors.surfaceMuted,
  },
  emptyState: {
    backgroundColor: colors.surfaceMuted,
  },
  confirmationCard: {
    borderColor: '#e6bb7f',
    backgroundColor: '#fff9f1',
  },
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
