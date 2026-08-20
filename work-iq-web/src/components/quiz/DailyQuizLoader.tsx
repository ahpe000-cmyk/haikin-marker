"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/domain/types";
import { selectDailyQuestions } from "@/lib/quiz/select-questions";
import { loadProgress } from "@/lib/storage/local-progress";
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
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    const progress = loadProgress();
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
        setQuestions(activeQuestions);
        return;
      }
    }

    const recentIds = progress.recentQuestions
      .filter((entry) => entry.dateKey >= weekAgoKey)
      .map((entry) => entry.id);
    setQuestions(
      selectDailyQuestions({
        businessTerms,
        judgment,
        risk,
        currentAffairs,
        recentQuestionIds: recentIds,
        seed: `${progress.anonId}-${todayKey}`,
      }),
    );
  }, [businessTerms, judgment, risk, currentAffairs]);

  if (!questions) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }
  return <QuizRunner questions={questions} kind="daily" />;
}
