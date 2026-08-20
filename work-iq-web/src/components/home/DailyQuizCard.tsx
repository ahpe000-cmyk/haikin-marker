"use client";

import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export function DailyQuizCard({
  completedToday,
  todaysScore,
  todaysSessionId,
}: {
  completedToday: boolean;
  todaysScore: number | null;
  todaysSessionId: string | null;
}) {
  return (
    <Card className="border-accent bg-accent-soft">
      <h2 className="text-base font-bold">今日の5問</h2>
      {completedToday ? (
        <>
          <p className="mt-2 text-sm">
            今日の挑戦は完了！スコア{" "}
            <span className="text-2xl font-bold tabular-nums">
              {todaysScore ?? "—"}
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            {todaysSessionId ? (
              <ButtonLink
                href={`/result/${todaysSessionId}`}
                variant="secondary"
                className="flex-1"
              >
                結果を見る
              </ButtonLink>
            ) : null}
            <ButtonLink href="/learn" variant="ghost" className="flex-1">
              もっと挑戦する
            </ButtonLink>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            約3分。用語・判断・リスクから毎日5問。
          </p>
          <ButtonLink href="/quiz/daily" className="mt-3 w-full">
            今日の5問に挑戦
          </ButtonLink>
        </>
      )}
    </Card>
  );
}
