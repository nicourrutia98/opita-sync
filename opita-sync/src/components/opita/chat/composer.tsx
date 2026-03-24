import { useEffect, useRef, type KeyboardEvent } from "react";
import { LoaderCircle, SendHorizontal, Square } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";

export function Composer({
  value,
  onChange,
  onSend,
  onCancel,
  disabled,
  canSend,
  sending,
  helperText,
  statusLabel,
  focusSignal = 0
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  canSend?: boolean;
  sending?: boolean;
  helperText?: string;
  statusLabel?: string;
  focusSignal?: number;
}) {
  const sendDisabled = disabled || !canSend || sending;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [focusSignal]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !sendDisabled) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-line/80 bg-panel/96 px-5 py-4 backdrop-blur">
      <div
        className={cn(
          "rounded-[30px] border p-3 shadow-[0_12px_26px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background-color] duration-200",
          disabled ? "border-line/80 bg-surface/80" : sending ? "border-brand/20 bg-brand-soft/35 shadow-[0_16px_30px_rgba(15,118,110,0.12)]" : "border-line/80 bg-surface/70"
        )}
      >
        <div className="flex items-end gap-3">
          <Textarea
            ref={textareaRef}
            autoGrow
            maxHeight={220}
            aria-label="Escribí un mensaje"
            className="scrollbar-opita min-h-[84px] max-h-[220px] resize-none overflow-y-auto border-0 bg-transparent px-4 py-3 text-[15px] leading-7 shadow-none focus-visible:border-transparent focus-visible:ring-0 disabled:bg-transparent"
            placeholder="Escribí tu mensaje..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />

          {sending && onCancel ? (
            <Button type="button" variant="ghost" className="h-12 shrink-0 rounded-[18px] px-4 text-subtle hover:bg-panel/80 hover:text-ink" onClick={onCancel}>
              <Square className="h-4 w-4" />
              Detener
            </Button>
          ) : null}

          <Button
            type="button"
            className="h-12 shrink-0 rounded-[18px] px-5 disabled:border disabled:border-line/80 disabled:bg-panel disabled:text-subtle disabled:opacity-100"
            onClick={onSend}
            disabled={sendDisabled}
            aria-busy={sending}
          >
            {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            {sending ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-xs leading-5", disabled ? "text-subtle" : "text-muted")}>{helperText}</p>
        {statusLabel ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
              sending
                ? "border-brand/15 bg-brand-soft/60 text-brand-strong"
                : disabled
                  ? "border-line/80 bg-surface/80 text-subtle"
                  : "border-line/80 bg-panel text-subtle"
            )}
          >
            {statusLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
