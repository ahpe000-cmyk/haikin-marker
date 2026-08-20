"use client";

import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export function ReviewCard({
  dueCount,
  yesterdayScore,
  yesterdayMissedCount,
}: {
  dueCount: number;
  yesterdayScore: number | null;
  yesterdayMissedCount: number;
}) {
  return (
    <Card>
      <h2 className="text-base font-bold">昨日の振り返り</h2>
      <div className="mt-2 flex items-center gap-6 text-sm">
        {yesterdayScore !== null ? (
          <p>
            昨日のスコア{" "}
            <span className="text-xl font-bold tabular-nums">
              {yesterdayScore}
            </span>
          </p>
        ) : null}
        {yesterdayMissedCount > 0 ? (
          <p className="text-muted">
            間違えた問題 {yesterdayMissedCount}問
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted">
        復習が{dueCount}問たまっています。
      </p>
      <ButtonLink href="/quiz/review" variant="secondary" className="mt-3 w-full">
        昨日の間違いを復習
      </ButtonLink>
    </Card>
  );
}
