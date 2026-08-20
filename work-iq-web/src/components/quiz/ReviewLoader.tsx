"use client";

import { useMemo } from "react";
import type { Question } from "@/lib/domain/types";
import { buildReviewQuestions } from "@/lib/review/build-review-session";
import { useProgress } from "@/lib/storage/use-progress";
import { getProgressSnapshot } from "@/lib/storage/progress-store";
import type { ProgressState } from "@/lib/storage/local-progress";
import { getJstDateKey } from "@/lib/time/jst";
import { ButtonLink } from "@/components/ui/Button";
import { QuizRunner } from "./QuizRunner";

export function ReviewLoader({ allQuestions }: { allQuestions: Question[] }) {
  const progress = useProgress();
  const hasProgress = progress !== null;

  // The review set is fixed at mount; later progress updates (the review
  // completion itself) must not rebuild it mid-session.
  const questions = useMemo<Question[] | null>(() => {
    if (!hasProgress) return null;
    return buildReviewQuestions(
      getProgressSnapshot() as ProgressState,
      allQuestions,
      getJstDateKey(),
    );
  }, [hasProgress, allQuestions]);

  if (questions === null) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-lg font-bold">今日の復習はありません</h1>
        <p className="mt-2 text-sm text-muted">
          間違えた問題は、1日 → 3日 → 7日 → 30日の間隔でここに戻ってきます。
        </p>
        <ButtonLink href="/quiz/daily" variant="secondary" className="mt-4">
          今日の5問に挑戦する
        </ButtonLink>
      </div>
    );
  }

  return <QuizRunner questions={questions} kind="review" />;
}
