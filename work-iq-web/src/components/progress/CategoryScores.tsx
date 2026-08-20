"use client";

import { CATEGORY_LABELS } from "@/lib/domain/categories";
import type { CategoryScore } from "@/lib/scoring/work-iq";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function CategoryScores({ scores }: { scores: CategoryScore[] }) {
  if (scores.length === 0) {
    return (
      <p className="text-sm text-muted">
        まだ記録がありません。5問挑戦するとカテゴリ別スコアが表示されます。
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {scores.map((score) => (
        <li key={score.category}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span>{CATEGORY_LABELS[score.category]}</span>
            <span className="font-bold tabular-nums">
              {score.score}
              <span className="ml-1 text-xs font-normal text-muted">
                （{score.answeredCount}問）
              </span>
            </span>
          </div>
          <ProgressBar
            value={score.score}
            max={100}
            label={`${CATEGORY_LABELS[score.category]}のスコア ${score.score}`}
          />
        </li>
      ))}
    </ul>
  );
}
