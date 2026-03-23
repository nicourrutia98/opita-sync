import { AlertTriangle, CheckCircle2, Inbox, LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

type StateTone = "loading" | "empty" | "error" | "success";

const iconMap = {
  loading: LoaderCircle,
  empty: Inbox,
  error: AlertTriangle,
  success: CheckCircle2
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
    <div className={cn("rounded-panel border border-dashed border-line bg-panel p-5 text-sm text-muted", className)}>
      <div className="flex items-center gap-3">
        <Icon className={cn("h-5 w-5", tone === "loading" && "animate-spin", tone === "error" && "text-danger", tone === "success" && "text-success")} />
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
