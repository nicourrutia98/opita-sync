import { MessageSquarePlus } from "lucide-react";
import type { ConversationSummary } from "../../../domain/opita";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { StateBlock } from "../../ui/state-block";
import { RecentChatItem } from "./recent-chat-item";

export function RecentChatsSidebar({
  chats,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onArchiveConversation,
  isCreatingConversation,
  isLoading,
  isError,
  errorMessage
}: {
  chats: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onArchiveConversation: (conversationId: string) => void;
  isCreatingConversation?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}) {
  const hasChats = chats.length > 0;

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b border-line/80 pb-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Conversaciones</p>
            <div>
              <CardTitle>Hilos recientes</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted">Retom? un hilo reciente, archiv? lo resuelto o abr? uno nuevo sin perder el contexto.</p>
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" className="w-full gap-2" onClick={onCreateConversation} disabled={Boolean(isLoading || isCreatingConversation)}>
            <MessageSquarePlus className="h-4 w-4" />
            {isCreatingConversation ? "Creando chat..." : "Nuevo chat"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-4 md:p-5">
        {isLoading ? (
          <div className="flex h-full items-center">
            <StateBlock
              tone="loading"
              title="Cargando conversaciones"
              description="Estamos recuperando los hilos recientes y su ?ltimo estado."
              className="w-full"
            />
          </div>
        ) : isError && !hasChats ? (
          <div className="flex h-full items-center">
            <StateBlock
              tone="error"
              title="No pudimos cargar los hilos"
              description={errorMessage ?? "Volv? a intentar en unos segundos para recuperar la lista reciente."}
              className="w-full"
            />
          </div>
        ) : !hasChats ? (
          <div className="flex h-full items-center">
            <StateBlock
              tone="empty"
              title="Sin conversaciones recientes"
              description="Abr? un nuevo chat para empezar un hilo limpio con el caso actual o con contexto general."
              className="w-full"
            />
          </div>
        ) : (
          <div className="scrollbar-opita flex h-full flex-col gap-3 overflow-y-auto pr-1">
            {chats.map((chat) => (
              <RecentChatItem
                key={chat.id}
                chat={chat}
                active={chat.id === activeConversationId}
                onClick={() => onSelectConversation(chat.id)}
                onArchive={() => onArchiveConversation(chat.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
