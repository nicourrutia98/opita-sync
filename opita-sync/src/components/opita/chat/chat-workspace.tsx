import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ChatMessage, ChatStreamEvent, ConversationSummary } from "../../../domain/opita";
import { useChatScrollController } from "../../../hooks/use-chat-scroll-controller";
import { useChatTransport } from "../../../hooks/use-chat-transport";
import { conversationMessagesQueryKey, useConversationMessages } from "../../../hooks/use-conversation-messages";
import { useRecentChats, recentChatsQueryKey } from "../../../hooks/use-recent-chats";
import { useRunStatus } from "../../../hooks/use-run-status";
import { useTTS } from "../../../hooks/use-tts";
import type { OpitaAppServices } from "../../../services/contracts";
import { StateBlock } from "../../ui/state-block";
import { ChatShell } from "./chat-shell";
import { Composer } from "./composer";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { NewMessagesIndicator } from "./new-messages-indicator";
import { RecentChatsSidebar } from "./recent-chats-sidebar";

function mergeMessages(base: ChatMessage[], local: ChatMessage[], draft: ChatMessage | null) {
  const merged = new Map<string, ChatMessage>();
  for (const item of [...base, ...local]) {
    merged.set(item.id, item);
  }
  const messages = [...merged.values()].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id.localeCompare(right.id);
    }
    return left.createdAt.localeCompare(right.createdAt);
  });
  return {
    messages,
    draft
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function upsertConversationSummary(current: ConversationSummary[], summary: ConversationSummary) {
  return [summary, ...current.filter((item) => item.id !== summary.id)].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function removeConversationSummary(current: ConversationSummary[], conversationId: string) {
  return current.filter((item) => item.id !== conversationId);
}

function ViewportState({
  tone,
  title,
  description
}: {
  tone: "loading" | "empty" | "error" | "success";
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-5 py-5">
      <StateBlock tone={tone} title={title} description={description} className="w-full max-w-2xl" />
    </div>
  );
}

export function ChatWorkspace({
  services,
  selectedCaseId
}: {
  services: OpitaAppServices;
  selectedCaseId?: string;
}) {
  const transport = useChatTransport(services);
  const queryClient = useQueryClient();
  const recentChats = useRecentChats(transport);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draftInputsByConversation, setDraftInputsByConversation] = useState<Record<string, string>>({});
  const [inactiveDraftValue, setInactiveDraftValue] = useState("");
  const [localMessagesByConversation, setLocalMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [draftByConversation, setDraftByConversation] = useState<Record<string, ChatMessage | null>>({});
  const [errorByConversation, setErrorByConversation] = useState<Record<string, string | null>>({});
  const [sendingConversationId, setSendingConversationId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isPreparingConversation, setIsPreparingConversation] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const [isRenamingConversation, setIsRenamingConversation] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const streamControllersRef = useRef<Map<string, AbortController>>(new Map());
  const { statusesByConversation, applyEvent, setCollapsed } = useRunStatus();
  const tts = useTTS();

  const conversations = recentChats.data ?? [];
  const hasConversations = conversations.length > 0;
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    if (activeConversationId && conversations.some((conversation) => conversation.id === activeConversationId)) {
      return;
    }

    if (selectedCaseId) {
      const match = conversations.find((conversation) => conversation.caseId === selectedCaseId);
      if (match) {
        setActiveConversationId(match.id);
        return;
      }
    }

    setActiveConversationId(conversations[0]?.id ?? null);
  }, [activeConversationId, conversations, selectedCaseId]);

  useEffect(() => {
    if (activeConversation && !isRenamingConversation) {
      setRenameValue(activeConversation.title);
    }
  }, [activeConversation, isRenamingConversation]);

  const conversationMessages = useConversationMessages(transport, activeConversationId);
  const activeLocalMessages = (activeConversationId && localMessagesByConversation[activeConversationId]) || [];
  const activeDraftMessage = (activeConversationId && draftByConversation[activeConversationId]) || null;
  const mergedMessages = useMemo(
    () => mergeMessages(conversationMessages.messages, activeLocalMessages, activeDraftMessage),
    [activeDraftMessage, activeLocalMessages, conversationMessages.messages]
  );
  const hasThreadMessages = mergedMessages.messages.length > 0 || Boolean(mergedMessages.draft);

  const scrollController = useChatScrollController({
    conversationId: activeConversationId,
    itemCount: mergedMessages.messages.length + (mergedMessages.draft ? 1 : 0),
    hasMoreBefore: Boolean(conversationMessages.hasNextPage),
    isFetchingOlder: conversationMessages.isFetchingNextPage,
    onLoadOlder: async () => {
      if (conversationMessages.hasNextPage) {
        await conversationMessages.fetchNextPage();
      }
    }
  });

  const updateRecentChats = useCallback(
    (conversationId: string, updater: (current: ConversationSummary[]) => ConversationSummary[]) => {
      queryClient.setQueryData([...recentChatsQueryKey, 20], (current: ConversationSummary[] | undefined) => updater(current ?? []));
      queryClient.invalidateQueries({ queryKey: recentChatsQueryKey });
      queryClient.invalidateQueries({ queryKey: conversationMessagesQueryKey(conversationId) });
    },
    [queryClient]
  );

  const updateConversationDraft = useCallback((conversationId: string | null, value: string) => {
    if (conversationId) {
      setDraftInputsByConversation((current) => ({ ...current, [conversationId]: value }));
      return;
    }
    setInactiveDraftValue(value);
  }, []);

  const handleStreamEvent = useCallback(
    (event: ChatStreamEvent) => {
      applyEvent(event);
      if (event.type === "message.delta") {
        setDraftByConversation((current) => {
          const draft = current[event.conversationId];
          if (!draft) {
            return current;
          }
          return {
            ...current,
            [event.conversationId]: { ...draft, content: `${draft.content}${event.delta}` }
          };
        });
      }
      if (event.type === "message.completed") {
        setLocalMessagesByConversation((current) => ({
          ...current,
          [event.conversationId]: [...(current[event.conversationId] ?? []), event.message]
        }));
        setDraftByConversation((current) => ({ ...current, [event.conversationId]: null }));
        updateRecentChats(event.conversationId, (current) =>
          current
            .map((item) =>
              item.id === event.conversationId
                ? { ...item, lastMessagePreview: event.message.content, updatedAt: event.message.createdAt, status: "completed" as const }
                : item
            )
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        );
      }
      if (event.type === "run.completed" || event.type === "run.error" || event.type === "run.cancelled") {
        streamControllersRef.current.delete(event.runId);
        setSendingConversationId((current) => (current === event.conversationId ? null : current));
      }
      if (event.type === "run.error") {
        setErrorByConversation((current) => ({ ...current, [event.conversationId]: event.error }));
        setDraftByConversation((current) => ({ ...current, [event.conversationId]: null }));
        updateRecentChats(event.conversationId, (current) => current.map((item) => (item.id === event.conversationId ? { ...item, status: "error" as const } : item)));
      }
      if (event.type === "run.cancelled") {
        setDraftByConversation((current) => ({ ...current, [event.conversationId]: null }));
        updateRecentChats(event.conversationId, (current) => current.map((item) => (item.id === event.conversationId ? { ...item, status: "cancelled" as const } : item)));
      }
    },
    [applyEvent, updateRecentChats]
  );

  const createAndActivateConversation = useCallback(
    async (seedDraft = "") => {
      const created = await transport.createConversation({ caseId: selectedCaseId });
      setActiveConversationId(created.id);
      setComposerError(null);
      setDraftMessage(null);
      setIsRenamingConversation(false);
      setRenameValue(created.title);
      setDraftInputsByConversation((current) => ({ ...current, [created.id]: seedDraft }));
      setInactiveDraftValue("");
      updateRecentChats(created.id, (current) => upsertConversationSummary(current, created));
      setFocusSignal((current) => current + 1);
      return created;
    },
    [selectedCaseId, transport, updateRecentChats]
  );

  const startStreamingRun = useCallback(
    (result: {
      runId: string;
      conversationId: string;
      userMessage: ChatMessage;
      assistantDraftMessage: ChatMessage;
      conversationSummary?: ConversationSummary;
      reusedUserMessageId?: string;
    },
    fallbackSummary?: ConversationSummary) => {
      const targetConversationId = result.conversationId;
      const nextSummary = result.conversationSummary ?? fallbackSummary;

      setActiveConversationId(targetConversationId);
      if (!result.reusedUserMessageId) {
        setLocalMessagesByConversation((current) => ({
          ...current,
          [targetConversationId]: [...(current[targetConversationId] ?? []), result.userMessage]
        }));
      }
      setDraftByConversation((current) => ({ ...current, [targetConversationId]: result.assistantDraftMessage }));
      setSendingConversationId(targetConversationId);
      updateRecentChats(targetConversationId, (current) =>
        upsertConversationSummary(current, {
          ...(nextSummary ?? {
            id: targetConversationId,
            title: activeConversation?.title ?? "Nuevo chat",
            caseId: selectedCaseId,
            lastMessagePreview: result.userMessage.content,
            updatedAt: result.userMessage.createdAt,
            status: "running"
          }),
          id: targetConversationId,
          caseId: nextSummary?.caseId ?? selectedCaseId,
          lastMessagePreview: result.userMessage.content,
          updatedAt: result.userMessage.createdAt,
          status: "running"
        })
      );

      const controller = new AbortController();
      streamControllersRef.current.set(result.runId, controller);
      applyEvent({
        type: "run.started",
        runId: result.runId,
        conversationId: targetConversationId,
        messageId: result.assistantDraftMessage.id,
        userMessageId: result.userMessage.id,
        assistantDraftMessageId: result.assistantDraftMessage.id,
        createdAt: result.assistantDraftMessage.createdAt
      });
      void transport.streamAssistantResponse({
        conversationId: targetConversationId,
        runId: result.runId,
        signal: controller.signal,
        onEvent: handleStreamEvent
      });
    },
    [activeConversation?.title, applyEvent, handleStreamEvent, selectedCaseId, transport, updateRecentChats]
  );

  const activeComposerValue = activeConversationId ? draftInputsByConversation[activeConversationId] ?? "" : inactiveDraftValue;

  const handleSend = useCallback(async () => {
    if (!activeComposerValue.trim() || isPreparingConversation || Boolean(activeConversationId && sendingConversationId === activeConversationId)) {
      return;
    }

    const content = activeComposerValue.trim();
    const previousConversationId = activeConversationId;
    const previousInactiveDraft = inactiveDraftValue;

    if (previousConversationId) {
      setErrorByConversation((current) => ({ ...current, [previousConversationId]: null }));
    }
    setComposerError(null);
    setDraftMessage(null);
    updateConversationDraft(previousConversationId, "");
    setIsPreparingConversation(!previousConversationId);

    let targetSummary: ConversationSummary | undefined;
    let targetConversationId = previousConversationId;

    try {
      if (!targetConversationId) {
        targetSummary = await createAndActivateConversation();
        targetConversationId = targetSummary.id;
      }

      const result = await transport.sendMessage({
        conversationId: targetConversationId,
        caseId: selectedCaseId,
        content,
        attachments: [],
        metadata: {}
      });

      startStreamingRun(result, targetSummary);
    } catch (error) {
      const errorMessage = getErrorMessage(error, "No se pudo enviar el mensaje.");
      if (targetConversationId) {
        setErrorByConversation((current) => ({ ...current, [targetConversationId!]: errorMessage }));
        updateConversationDraft(targetConversationId, content);
      } else {
        setComposerError(errorMessage);
        setInactiveDraftValue(previousInactiveDraft || content);
      }
      setSendingConversationId(null);
    } finally {
      setIsPreparingConversation(false);
    }
  }, [activeComposerValue, activeConversationId, createAndActivateConversation, inactiveDraftValue, isPreparingConversation, selectedCaseId, sendingConversationId, startStreamingRun, transport, updateConversationDraft]);

  const handleNewConversation = useCallback(async () => {
    if (isCreatingConversation || isPreparingConversation) {
      return;
    }
    setIsCreatingConversation(true);
    try {
      const seedDraft = activeConversationId ? "" : inactiveDraftValue;
      await createAndActivateConversation(seedDraft);
    } catch (error) {
      setComposerError(getErrorMessage(error, "No se pudo crear un chat nuevo."));
    } finally {
      setIsCreatingConversation(false);
    }
  }, [activeConversationId, createAndActivateConversation, inactiveDraftValue, isCreatingConversation, isPreparingConversation]);

  const handleCancel = useCallback(async () => {
    const currentStatus = activeConversationId ? statusesByConversation[activeConversationId] : undefined;
    if (!activeConversationId || !currentStatus) {
      return;
    }
    streamControllersRef.current.get(currentStatus.runId)?.abort();
    await transport.cancelRun({ runId: currentStatus.runId });
    handleStreamEvent({ type: "run.cancelled", runId: currentStatus.runId, conversationId: activeConversationId });
  }, [activeConversationId, handleStreamEvent, statusesByConversation, transport]);

  const handleRetry = useCallback(async () => {
    if (!activeConversationId) {
      return;
    }
    setErrorByConversation((current) => ({ ...current, [activeConversationId]: null }));
    setComposerError(null);
    try {
      const result = await transport.retryLastMessage({ conversationId: activeConversationId });
      startStreamingRun(result, result.conversationSummary);
    } catch (error) {
      setErrorByConversation((current) => ({
        ...current,
        [activeConversationId]: getErrorMessage(error, "No se pudo reintentar la ?ltima respuesta.")
      }));
    }
  }, [activeConversationId, startStreamingRun, transport]);

  const handleRenameSubmit = useCallback(async () => {
    if (!activeConversationId || !renameValue.trim()) {
      return;
    }
    try {
      const summary = await transport.updateConversation({ conversationId: activeConversationId, title: renameValue.trim() });
      updateRecentChats(activeConversationId, (current) => upsertConversationSummary(current, summary));
      setIsRenamingConversation(false);
    } catch (error) {
      setErrorByConversation((current) => ({
        ...current,
        [activeConversationId]: getErrorMessage(error, "No se pudo renombrar la conversaci?n.")
      }));
    }
  }, [activeConversationId, renameValue, transport, updateRecentChats]);

  const handleArchiveConversation = useCallback(
    async (conversationId: string) => {
      try {
        await transport.updateConversation({ conversationId, archived: true });
        updateRecentChats(conversationId, (current) => removeConversationSummary(current, conversationId));
        if (activeConversationId === conversationId) {
          const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
          const fallback = selectedCaseId ? remaining.find((conversation) => conversation.caseId === selectedCaseId)?.id : undefined;
          setActiveConversationId(fallback ?? remaining[0]?.id ?? null);
          setIsRenamingConversation(false);
        }
      } catch (error) {
        setErrorByConversation((current) => ({
          ...current,
          [conversationId]: getErrorMessage(error, "No se pudo archivar la conversaci?n.")
        }));
      }
    },
    [activeConversationId, conversations, selectedCaseId, transport, updateRecentChats]
  );

  const runStatus = activeConversationId ? statusesByConversation[activeConversationId] : undefined;
  const activeError = (activeConversationId && errorByConversation[activeConversationId]) || null;
  const isSendingActiveConversation = Boolean(activeConversationId && sendingConversationId === activeConversationId);
  const isComposerBusy = isPreparingConversation || isSendingActiveConversation;

  const handleGenerateDraft = useCallback(async () => {
    if (!selectedCaseId) {
      setDraftMessage("No hay un caso activo para generar un borrador contextual.");
      return;
    }
    try {
      const result = await services.draftService.generateDraft({
        caseId: selectedCaseId,
        prompt: activeComposerValue.trim() || activeConversation?.lastMessagePreview || "Gener? un borrador operativo breve.",
        channel: "interno",
        tone: "Operativo formal"
      });
      setDraftMessage(result.content);
    } catch (error) {
      setDraftMessage(getErrorMessage(error, "No se pudo generar el borrador asistido."));
    }
  }, [activeComposerValue, activeConversation?.lastMessagePreview, selectedCaseId, services.draftService]);

  const composerDisabledReason = recentChats.isLoading && !activeConversationId ? "Estamos cargando las conversaciones antes de habilitar el chat." : null;
  const composerDisabled = Boolean(composerDisabledReason);
  const composerHint = (() => {
    if (composerDisabledReason) {
      return composerDisabledReason;
    }
    if (isPreparingConversation) {
      return "Estamos creando el chat y preparando el primer turno del hilo.";
    }
    if (isCreatingConversation) {
      return "Estamos creando un nuevo chat operativo para este contexto.";
    }
    if (!activeConversationId) {
      return "Abr? un nuevo chat o eleg? uno reciente. Si envi?s sin seleccionar, vamos a crear un hilo real antes del primer turno.";
    }
    if (isSendingActiveConversation) {
      return "La IA est? respondiendo. Pod?s preparar el siguiente mensaje sin perder el borrador de este hilo.";
    }
    return "Enter env?a. Shift + Enter agrega salto de l?nea. Cada chat conserva su propio borrador y scroll interno.";
  })();

  const composerStatusLabel = (() => {
    if (composerDisabled) {
      return recentChats.isLoading ? "Cargando" : "Bloqueado";
    }
    if (isPreparingConversation) {
      return "Creando hilo";
    }
    if (!activeConversationId) {
      return "Sin chat activo";
    }
    if (isSendingActiveConversation) {
      return "IA respondiendo";
    }
    return "Listo para enviar";
  })();

  const canSend = Boolean(activeComposerValue.trim() && !composerDisabled && !isComposerBusy);

  const headerState = (() => {
    if (recentChats.isLoading && !hasConversations && !activeConversationId) {
      return {
        title: "Preparando el chat",
        description: "Estamos cargando conversaciones y mensajes para recuperar el contexto reciente.",
        badgeLabel: "Cargando",
        badgeTone: "neutral" as const
      };
    }

    if (!activeConversationId && !hasConversations) {
      return {
        title: "Abr? un nuevo chat",
        description: "Cada chat nuevo crea un hilo real y limpio. Si hay un caso seleccionado, el nuevo chat hereda ese contexto.",
        badgeLabel: "Sin hilos",
        badgeTone: "warning" as const
      };
    }

    if (!activeConversationId) {
      return {
        title: "Eleg? un hilo o abr? uno nuevo",
        description: "Pod?s retomar conversaciones recientes o empezar un chat nuevo sin mezclar contexto ni borradores.",
        badgeLabel: "Listo para operar",
        badgeTone: "neutral" as const
      };
    }

    if (!hasThreadMessages) {
      return {
        title: activeConversation?.title ?? "Nuevo chat",
        description: "Este chat est? listo. Escrib? el primer mensaje para iniciar el hilo o gener? un borrador con el caso activo.",
        badgeLabel: "Chat listo",
        badgeTone: "brand" as const
      };
    }

    return {
      title: activeConversation?.title ?? "Hilo activo",
      description:
        runStatus?.status === "running"
          ? "La IA est? respondiendo en tiempo real. Pod?s seguir la actividad del agente y los pasos de herramientas sin perder el hilo."
          : "Historial ascendente, borrador por conversaci?n y contexto persistente listos para una operaci?n LLM usable.",
      badgeLabel: runStatus?.status === "running" ? "IA respondiendo" : "Hilo activo",
      badgeTone: runStatus?.status === "running" ? ("brand" as const) : ("neutral" as const)
    };
  })();

  const messagesView = (() => {
    if (recentChats.isLoading && !hasConversations && !activeConversationId) {
      return <ViewportState tone="loading" title="Cargando conversaciones" description="Preparando el workspace conversacional y el acceso a los hilos recientes." />;
    }

    if (recentChats.isError && !hasConversations && !activeConversationId) {
      return (
        <ViewportState
          tone="error"
          title="No pudimos recuperar el chat"
          description={getErrorMessage(recentChats.error, "Volv? a intentar en unos segundos para restaurar las conversaciones recientes.")}
        />
      );
    }

    if (!activeConversationId) {
      return (
        <ViewportState
          tone={composerError ? "error" : "empty"}
          title={composerError ? "No pudimos preparar el chat" : "Sin chat activo"}
          description={composerError ?? "Abr? un nuevo chat desde la derecha o seleccion? un hilo reciente para continuar la conversaci?n."}
        />
      );
    }

    if (conversationMessages.isLoading && !activeLocalMessages.length && !activeDraftMessage) {
      return <ViewportState tone="loading" title="Cargando mensajes" description="Estamos recuperando el historial de esta conversaci?n." />;
    }

    if (conversationMessages.isError && !activeLocalMessages.length && !activeDraftMessage) {
      return (
        <ViewportState
          tone="error"
          title="No pudimos cargar los mensajes"
          description={getErrorMessage(conversationMessages.error, "Volv? a intentar para recuperar el historial del hilo seleccionado.")}
        />
      );
    }

    return (
      <div className="flex min-h-full flex-1 flex-col">
        {activeError || composerError || draftMessage ? (
          <div className="space-y-3 px-5 pt-5">
            {activeError ? <StateBlock tone="error" title="No se pudo continuar la respuesta" description={activeError} /> : null}
            {composerError ? <StateBlock tone="error" title="No pudimos iniciar el hilo" description={composerError} /> : null}
            {draftMessage ? <StateBlock tone="success" title="Borrador asistido" description={draftMessage} /> : null}
          </div>
        ) : null}

        <MessageList
          messages={mergedMessages.messages}
          draftMessage={mergedMessages.draft}
          runStatus={runStatus}
          activeTtsMessageId={tts.activeMessageId}
          ttsEnabled={tts.supported}
          onSpeak={(message) => tts.toggle(message.id, message.content)}
          onStop={tts.stop}
          onToggleRunStatus={runStatus ? () => setCollapsed(runStatus.runId, !runStatus.collapsed) : undefined}
          topSentinelRef={scrollController.topSentinelRef}
          className="flex-1"
          emptyTitle="Todo listo para empezar"
          emptyDescription="Este chat todav?a no tiene mensajes. Escrib? el primero desde el composer para iniciar el hilo."
        />
      </div>
    );
  })();

  return (
    <ChatShell
      header={
        <ConversationHeader
          title={headerState.title}
          description={headerState.description}
          badgeLabel={headerState.badgeLabel}
          badgeTone={headerState.badgeTone}
          runStatus={runStatus}
          onGenerateDraft={handleGenerateDraft}
          onCancelRun={handleCancel}
          onNewChat={handleNewConversation}
          onRetry={activeConversationId ? handleRetry : undefined}
          onArchive={activeConversationId ? () => handleArchiveConversation(activeConversationId) : undefined}
          onStartRename={activeConversationId ? () => setIsRenamingConversation(true) : undefined}
          onRenameChange={setRenameValue}
          onRenameSubmit={handleRenameSubmit}
          onRenameCancel={() => {
            setIsRenamingConversation(false);
            setRenameValue(activeConversation?.title ?? "");
          }}
          renameValue={renameValue}
          isRenaming={isRenamingConversation}
          disableGenerateDraft={!selectedCaseId}
          disableRetry={!activeConversationId || runStatus?.status === "running" || !mergedMessages.messages.some((message) => message.role === "user")}
          disableArchive={!activeConversationId}
          disableRename={!activeConversationId}
          creatingConversation={isCreatingConversation}
        />
      }
      messages={messagesView}
      composer={
        <Composer
          value={activeComposerValue}
          onChange={(value) => updateConversationDraft(activeConversationId, value)}
          onSend={handleSend}
          onCancel={runStatus?.status === "running" ? handleCancel : undefined}
          disabled={composerDisabled}
          canSend={canSend}
          sending={isComposerBusy}
          helperText={composerHint}
          statusLabel={composerStatusLabel}
          focusSignal={focusSignal}
        />
      }
      sidebar={
        <RecentChatsSidebar
          chats={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(conversationId) => {
            setActiveConversationId(conversationId);
            setComposerError(null);
            setDraftMessage(null);
          }}
          onCreateConversation={handleNewConversation}
          onArchiveConversation={handleArchiveConversation}
          isCreatingConversation={isCreatingConversation}
          isLoading={recentChats.isLoading}
          isError={recentChats.isError}
          errorMessage={getErrorMessage(recentChats.error, "Volv? a intentar para recuperar las conversaciones recientes.")}
        />
      }
      newMessagesIndicator={<NewMessagesIndicator visible={scrollController.showNewMessages} onClick={() => scrollController.scrollToBottom()} />}
      messageContainerRef={scrollController.containerRef}
      onScroll={scrollController.handleScroll}
    />
  );
}
