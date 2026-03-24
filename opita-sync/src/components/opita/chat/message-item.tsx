import type { ChatMessage } from "../../../domain/opita";
import { cn } from "../../../lib/utils";
import { TTSControls } from "./tts-controls";

export function MessageItem({
  message,
  highlightTts,
  ttsEnabled,
  onSpeak,
  onStop
}: {
  message: ChatMessage;
  highlightTts?: boolean;
  ttsEnabled?: boolean;
  onSpeak?: () => void;
  onStop?: () => void;
}) {
  const assistant = message.role === "assistant";

  return (
    <article className={assistant ? "mr-auto max-w-[48rem]" : "ml-auto max-w-[44rem]"} data-message-id={message.id}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
        <span>{assistant ? "Asistente" : "Tú"}</span>
        {assistant && onSpeak && onStop ? <TTSControls canPlay={Boolean(ttsEnabled)} isActive={Boolean(highlightTts)} onPlay={onSpeak} onStop={onStop} /> : null}
      </div>
      <div
        className={cn(
          "whitespace-pre-wrap break-words rounded-[26px] px-5 py-4 text-sm leading-7 shadow-[0_10px_26px_rgba(15,23,42,0.04)]",
          assistant
            ? "rounded-tl-[10px] border border-line/80 bg-panel text-ink"
            : "rounded-tr-[10px] border border-brand/10 bg-brand text-white",
          highlightTts && assistant ? "ring-2 ring-brand/30" : ""
        )}
      >
        {message.content}
      </div>
    </article>
  );
}
