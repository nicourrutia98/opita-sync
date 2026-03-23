import { ArrowRight, Clock3 } from "lucide-react";
import type { CaseSummaryViewModel } from "../../services/view-models";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const toneByStatus = {
  Nuevo: "brand",
  "En curso": "warning",
  Bloqueado: "danger",
  Resuelto: "success"
} as const;

interface CaseCardProps {
  item: CaseSummaryViewModel;
  onOpen: () => void;
}

export function CaseCard({ item, onOpen }: CaseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">{item.id}</p>
            <h3 className="mt-1 text-base font-semibold text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.site}</p>
          </div>
          <Badge tone={toneByStatus[item.status]}>{item.status}</Badge>
        </div>

        <p className="text-sm text-muted">{item.summary}</p>

        <div className="flex items-center justify-between text-xs text-muted">
          <span>Prioridad: {item.priority}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {item.updatedAt}
          </span>
        </div>

        <Button variant="secondary" className="w-full justify-between" onClick={onOpen}>
          Ver detalle
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
