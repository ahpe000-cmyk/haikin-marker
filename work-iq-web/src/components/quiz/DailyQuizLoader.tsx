"use client";

import { useMemo } from "react";
import type { Question } from "@/lib/domain/types";
import { selectDailyQuestions } from "@/lib/quiz/select-questions";
import { useProgress } from "@/lib/storage/use-progress";
import { loadActiveSession } from "@/lib/storage/active-session";
import { addDaysToDateKey, getJstDateKey } from "@/lib/time/jst";
import { QuizRunner } from "./QuizRunner";

export function DailyQuizLoader({
  businessTerms,
  judgment,
  risk,
  currentAffairs,
}: {
  businessTerms: Question[];
  judgment: Question[];
  risk: Question[];
  currentAffairs: Question[];
}) {
  const progress = useProgress();

  const questions = useMemo<Question[] | null>(() => {
    if (!progress) return null;
    const todayKey = getJstDateKey();
    const weekAgoKey = addDaysToDateKey(todayKey, -7);
    const allQuestions = [
      ...businessTerms,
      ...judgment,
      ...risk,
      ...currentAffairs,
    ];

    // A daily session in flight today resumes with its own question set.
    const active = loadActiveSession();
    if (
      active &&
      active.kind === "daily" &&
      active.dateKey === todayKey &&
      !active.completedAt &&
      active.answers.length < active.questionIds.length
    ) {
      const activeQuestions = active.questionIds
        .map((id) => allQuestions.find((q) => q.id === id))
        .filter((q): q is Question => q !== undefined);
      if (activeQuestions.length === active.questionIds.length) {
        return activeQuestions;
      }
    }

    const recentIds = progress.recentQuestions
      .filter((entry) => entry.dateKey >= weekAgoKey)
      .map((entry) => entry.id);
    return selectDailyQuestions({
      businessTerms,
      judgment,
      risk,
      currentAffairs,
      recentQuestionIds: recentIds,
      seed: `${progress.anonId}-${todayKey}`,
    });
  }, [progress, businessTerms, judgment, risk, currentAffairs]);

  if (!questions) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }
  return <QuizRunner questions={questions} kind="daily" />;
}
