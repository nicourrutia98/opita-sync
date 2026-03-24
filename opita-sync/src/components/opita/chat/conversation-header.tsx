import { Archive, Check, LoaderCircle, MessageSquarePlus, PencilLine, RotateCcw, Sparkles, StopCircle, X } from "lucide-react";
import type { RunStatusViewModel } from "../../../hooks/use-run-status";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

type HeaderBadgeTone = "neutral" | "brand" | "warning" | "danger";

const badgeToneClasses: Record<HeaderBadgeTone, string> = {
  neutral: "border-line/80 bg-surface/80 text-subtle",
  brand: "border-brand/15 bg-brand-soft/60 text-brand-strong",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-danger/15 bg-danger/10 text-danger"
};

export function ConversationHeader({
  title,
  description,
  badgeLabel,
  badgeTone = "neutral",
  runStatus,
  onGenerateDraft,
  onCancelRun,
  onNewChat,
  onRetry,
  onArchive,
  onStartRename,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  renameValue,
  isRenaming = false,
  disableGenerateDraft = false,
  disableRetry = false,
  disableArchive = false,
  disableRename = false,
  creatingConversation = false
}: {
  title: string;
  description: string;
  badgeLabel?: string;
  badgeTone?: HeaderBadgeTone;
  runStatus?: RunStatusViewModel;
  onGenerateDraft?: () => void;
  onCancelRun?: () => void;
  onNewChat?: () => void;
  onRetry?: () => void;
  onArchive?: () => void;
  onStartRename?: () => void;
  onRenameChange?: (value: string) => void;
  onRenameSubmit?: () => void;
  onRenameCancel?: () => void;
  renameValue?: string;
  isRenaming?: boolean;
  disableGenerateDraft?: boolean;
  disableRetry?: boolean;
  disableArchive?: boolean;
  disableRename?: boolean;
  creatingConversation?: boolean;
}) {
  return (
    <div className="shrink-0 border-b border-line/80 px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Chat LLM</p>
            {badgeLabel ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
                  badgeToneClasses[badgeTone]
                )}
              >
                {badgeLabel}
              </span>
            ) : null}
          </div>
          <div>
            {isRenaming ? (
              <div className="flex max-w-2xl items-center gap-2">
                <Input value={renameValue ?? ""} onChange={(event) => onRenameChange?.(event.target.value)} aria-label="Renombrar conversaci?n" />
                <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={onRenameSubmit}>
                  <Check className="h-4 w-4" />
                  Guardar
                </Button>
                <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onRenameCancel}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            ) : (
              <h2 className="truncate text-xl font-semibold tracking-[-0.02em] text-ink">{title}</h2>
            )}
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {onNewChat ? (
            <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={onNewChat} disabled={creatingConversation}>
              <MessageSquarePlus className="h-4 w-4" />
              {creatingConversation ? "Creando chat..." : "Nuevo chat"}
            </Button>
          ) : null}
          {onStartRename && !isRenaming ? (
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onStartRename} disabled={disableRename}>
              <PencilLine className="h-4 w-4" />
              Renombrar
            </Button>
          ) : null}
          {onRetry ? (
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onRetry} disabled={disableRetry}>
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
          ) : null}
          {onArchive ? (
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onArchive} disabled={disableArchive}>
              <Archive className="h-4 w-4" />
              Archivar
            </Button>
          ) : null}
          {onGenerateDraft ? (
            <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={onGenerateDraft} disabled={disableGenerateDraft}>
              <Sparkles className="h-4 w-4" />
              Generar borrador
            </Button>
          ) : null}
          {runStatus?.status === "running" && onCancelRun ? (
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onCancelRun}>
              <StopCircle className="h-4 w-4" />
              Cancelar respuesta
            </Button>
          ) : null}
        </div>
      </div>

      {runStatus?.status === "running" ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-brand-strong" aria-live="polite">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {runStatus.label}
        </div>
      ) : null}
    </div>
  );
}
