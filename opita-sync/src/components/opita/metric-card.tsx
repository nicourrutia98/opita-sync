import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
        <p className="mt-2 text-sm text-muted">{helper}</p>
      </CardContent>
    </Card>
  );
}
