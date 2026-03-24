import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <Card className="bg-panel/90">
      <CardHeader className="pb-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-subtle">{label}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-4xl font-semibold tracking-tight text-ink">{value}</p>
        <p className="mt-3 text-sm leading-6 text-muted">{helper}</p>
      </CardContent>
    </Card>
  );
}
