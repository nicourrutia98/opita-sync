import { Archive } from "lucide-react";
import type { ConversationSummary } from "../../../domain/opita";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";

function formatTimestamp(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

const statusMeta: Record<NonNullable<ConversationSummary["status"]>, { label: string; className: string }> = {
  queued: { label: "En cola", className: "bg-surface text-subtle" },
  running: { label: "Respondiendo", className: "bg-brand-soft/70 text-brand-strong" },
  completed: { label: "Actualizada", className: "bg-emerald-50 text-emerald-700" },
  error: { label: "Con error", className: "bg-danger/10 text-danger" },
  cancelled: { label: "Cancelada", className: "bg-amber-50 text-amber-700" }
};

export function RecentChatItem({
  chat,
  active,
  onClick,
  onArchive
}: {
  chat: ConversationSummary;
  active: boolean;
  onClick: () => void;
  onArchive?: () => void;
}) {
  const status = chat.status ? statusMeta[chat.status] : null;

  return (
    <div
      className={cn(
        "w-full rounded-[22px] border px-4 py-3 transition",
        active
          ? "border-brand/25 bg-brand-soft/45 shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
          : "border-line/80 bg-panel hover:border-line hover:bg-surface/90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="truncate font-semibold text-ink">{chat.title}</p>
              {status ? (
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]", status.className)}>
                  {status.label}
                </span>
              ) : null}
            </div>
            <span className="shrink-0 text-xs text-subtle">{formatTimestamp(chat.updatedAt)}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{chat.lastMessagePreview || "Sin vista previa todav?a."}</p>
        </button>

        {onArchive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 rounded-2xl px-3 text-subtle hover:text-ink"
            onClick={onArchive}
            aria-label={`Archivar ${chat.title}`}
          >
            <Archive className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
