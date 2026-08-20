import { Card } from "@/components/ui/Card";

export function SessionScore({
  score,
  correctCount,
  totalCount,
  kindLabel,
}: {
  score: number;
  correctCount: number;
  totalCount: number;
  kindLabel: string;
}) {
  return (
    <Card className="text-center">
      <p className="text-sm font-semibold text-muted">{kindLabel}</p>
      <p className="mt-1 text-6xl font-bold tabular-nums tracking-tight">
        {score}
      </p>
      <p className="mt-1 text-sm text-muted">
        {totalCount}問中{correctCount}問正解
      </p>
    </Card>
  );
}
