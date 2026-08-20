"use client";

import { useEffect, useState } from "react";
import type { Question, Step } from "@/lib/domain/types";
import type { EvergreenSlug } from "@/lib/domain/categories";
import { SLUG_TO_CATEGORY } from "@/lib/domain/categories";
import {
  loadProgress,
  type EvergreenCategory,
} from "@/lib/storage/local-progress";
import { ButtonLink } from "@/components/ui/Button";
import { QuizRunner } from "./QuizRunner";

export function StepQuizGate({
  slug,
  step,
  questions,
}: {
  slug: EvergreenSlug;
  step: Step;
  questions: Question[];
}) {
  const category = SLUG_TO_CATEGORY[slug] as EvergreenCategory;
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setUnlocked(loadProgress().stepUnlocks[category] >= step);
  }, [category, step]);

  if (unlocked === null) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }

  if (!unlocked) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-lg font-bold">STEP {step}はまだロック中です</h1>
        <p className="mt-2 text-sm text-muted">
          STEP {step - 1}で4問以上正解すると解放されます。
        </p>
        <ButtonLink
          href={`/learn/${slug}`}
          variant="secondary"
          className="mt-4"
        >
          STEP一覧へ戻る
        </ButtonLink>
      </div>
    );
  }

  return (
    <QuizRunner
      questions={questions}
      kind="step"
      category={category}
      step={step}
    />
  );
}
