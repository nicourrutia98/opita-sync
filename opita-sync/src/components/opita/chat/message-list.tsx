import type { ChatMessage } from "../../../domain/opita";
import type { RunStatusViewModel } from "../../../hooks/use-run-status";
import { cn } from "../../../lib/utils";
import { StateBlock } from "../../ui/state-block";
import { AssistantDraftMessage } from "./assistant-draft-message";
import { MessageItem } from "./message-item";

export function MessageList({
  messages,
  draftMessage,
  runStatus,
  activeTtsMessageId,
  ttsEnabled,
  onSpeak,
  onStop,
  onToggleRunStatus,
  topSentinelRef,
  className,
  emptyTitle = "Todavía no hay mensajes",
  emptyDescription = "Escribí el primer mensaje para iniciar esta conversación."
}: {
  messages: ChatMessage[];
  draftMessage: ChatMessage | null;
  runStatus?: RunStatusViewModel;
  activeTtsMessageId: string | null;
  ttsEnabled: boolean;
  onSpeak: (message: ChatMessage) => void;
  onStop: () => void;
  onToggleRunStatus?: () => void;
  topSentinelRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const hasContent = messages.length > 0 || Boolean(draftMessage);

  if (!hasContent) {
    return (
      <div className={cn("flex min-h-full flex-col px-5 py-5", className)}>
        <div ref={topSentinelRef} className="h-1 w-full shrink-0" />
        <div className="flex flex-1 items-center justify-center py-8">
          <StateBlock tone="empty" title={emptyTitle} description={emptyDescription} className="w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-full flex-col px-5 py-5", className)}>
      <div ref={topSentinelRef} className="h-1 w-full shrink-0" />
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            ttsEnabled={ttsEnabled}
            highlightTts={activeTtsMessageId === message.id}
            onSpeak={message.role === "assistant" ? () => onSpeak(message) : undefined}
            onStop={message.role === "assistant" ? onStop : undefined}
          />
        ))}
        {draftMessage ? <AssistantDraftMessage message={draftMessage} status={runStatus} onToggleStatus={onToggleRunStatus} /> : null}
      </div>
    </div>
  );
}
