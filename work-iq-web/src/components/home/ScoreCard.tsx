"use client";

import { Card } from "@/components/ui/Card";
import {
  SCORE_STATE_LABELS,
  type ScoreState,
} from "@/lib/scoring/work-iq";

export function ScoreCard({
  overall,
  scoreState,
  streak,
}: {
  overall: number | null;
  scoreState: ScoreState;
  streak: number;
}) {
  return (
    <Card>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">
            {scoreState === "work_iq"
              ? "あなたのWORK IQ"
              : `あなたのWORK IQ（${SCORE_STATE_LABELS[scoreState]}）`}
          </p>
          <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight">
            {overall === null ? "—" : overall}
          </p>
          {scoreState === "measuring" ? (
            <p className="mt-1 text-xs text-muted">
              5問答えると仮スコアが表示されます
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-muted">連続挑戦</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {streak}
            <span className="ml-1 text-sm font-medium text-muted">日</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
