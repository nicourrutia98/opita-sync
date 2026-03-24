import { BrainCircuit, CheckCircle2, Cog, LoaderCircle, OctagonX, Search, XCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { RunStatusViewModel } from "../../../hooks/use-run-status";

const toolStatusLabel = {
  started: "Iniciada",
  progress: "En curso",
  completed: "Lista",
  failed: "Con error"
} as const;

function getRunIcon(status: RunStatusViewModel) {
  if (status.status === "error") {
    return <OctagonX className="h-4 w-4" />;
  }
  if (status.status === "cancelled") {
    return <XCircle className="h-4 w-4" />;
  }
  if (status.phase === "using_tool") {
    return <Cog className="h-4 w-4" />;
  }
  if (status.phase === "reading_context") {
    return <Search className="h-4 w-4" />;
  }
  if (status.phase === "reasoning") {
    return <BrainCircuit className="h-4 w-4" />;
  }
  if (status.status === "completed") {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  return <LoaderCircle className="h-4 w-4 animate-spin" />;
}

export function InlineRunStatus({
  status,
  compact = false,
  onToggle
}: {
  status: RunStatusViewModel;
  compact?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full rounded-[22px] border border-line/80 bg-surface/85 px-4 py-3 text-left text-sm text-muted",
        compact ? "max-w-[38rem]" : ""
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-strong">
        {getRunIcon(status)}
        {status.label}
      </div>
      {!status.collapsed && status.detail ? <p className="mt-2 leading-6">{status.detail}</p> : null}
      {!status.collapsed && status.tools.length ? (
        <div className="mt-3 space-y-2 rounded-[18px] border border-line/70 bg-panel/75 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">Actividad del agente</p>
          <div className="space-y-2">
            {status.tools.map((tool) => (
              <div key={tool.id} className="rounded-2xl border border-line/60 bg-surface/80 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-ink">
                  <span className="truncate">{tool.toolName}</span>
                  <span className="shrink-0 rounded-full border border-line/70 bg-panel px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-subtle">
                    {toolStatusLabel[tool.status]}
                  </span>
                </div>
                {tool.detail ? <p className="mt-1 text-xs leading-5 text-muted">{tool.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {status.collapsed && status.detail ? <p className="mt-2 text-xs text-subtle">{status.detail}</p> : null}
    </button>
  );
}
