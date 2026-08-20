"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadProgress,
  type ProgressState,
} from "@/lib/storage/local-progress";
import {
  SCORE_STATE_LABELS,
  calculateCategoryScores,
  calculateOverallWorkIq,
  getScoreState,
} from "@/lib/scoring/work-iq";
import { Card } from "@/components/ui/Card";
import { CategoryScores } from "./CategoryScores";
import { ScoreDisclaimer } from "./ScoreDisclaimer";

const KIND_LABELS: Record<string, string> = {
  daily: "今日の5問",
  step: "STEP",
  current_affairs: "時事",
  review: "復習",
};

export function ProgressScreen() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }

  const categoryScores = calculateCategoryScores(progress.answerHistory);
  const overall = calculateOverallWorkIq(categoryScores);
  const scoreState = getScoreState(progress.answerHistory);
  const recentSessions = [...progress.sessions]
    .filter((s) => s.completedAt)
    .slice(-10)
    .reverse();

  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-xl font-bold">成長</h1>

      <Card className="text-center">
        <p className="text-sm font-semibold text-muted">
          {scoreState === "work_iq"
            ? "あなたのWORK IQ"
            : `あなたのWORK IQ（${SCORE_STATE_LABELS[scoreState]}）`}
        </p>
        <p className="mt-1 text-6xl font-bold tabular-nums tracking-tight">
          {overall ?? "—"}
        </p>
        <p className="mt-2 text-sm text-muted">
          連続挑戦 {progress.streak.current}日
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold">カテゴリ別スコア</h2>
        <CategoryScores scores={categoryScores} />
        <div className="mt-4 border-t border-line pt-3">
          <ScoreDisclaimer />
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-bold">最近の挑戦</h2>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-muted">
            まだ挑戦がありません。今日の5問から始めましょう。
          </p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/result/${session.id}`}
                  className="flex min-h-[44px] items-center justify-between py-2"
                >
                  <span>
                    {session.dateKey}・{KIND_LABELS[session.kind] ?? session.kind}
                    {session.step ? ` ${session.step}` : ""}
                  </span>
                  <span className="font-bold tabular-nums">
                    {session.sessionScore ?? "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
