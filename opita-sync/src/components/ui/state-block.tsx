import { AlertTriangle, CheckCircle2, Inbox, LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

type StateTone = "loading" | "empty" | "error" | "success";

const iconMap = {
  loading: LoaderCircle,
  empty: Inbox,
  error: AlertTriangle,
  success: CheckCircle2
};

const toneClasses: Record<StateTone, string> = {
  loading: "border-line/80 bg-panel text-muted",
  empty: "border-line/80 bg-surface/70 text-muted",
  error: "border-danger/20 bg-danger/5 text-muted",
  success: "border-success/20 bg-emerald-50/80 text-muted"
};

export interface StateBlockProps {
  tone: StateTone;
  title: string;
  description: string;
  className?: string;
}

export function StateBlock({ tone, title, description, className }: StateBlockProps) {
  const Icon = iconMap[tone];
  return (
    <div className={cn("rounded-[26px] border border-dashed p-5 text-sm", toneClasses[tone], className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full border border-current/10 bg-panel/80 p-2">
          <Icon className={cn("h-4 w-4", tone === "loading" && "animate-spin", tone === "error" && "text-danger", tone === "success" && "text-success")} />
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-ink">{title}</p>
          <p className="leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
}
