"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/domain/types";
import type { EvergreenSlug } from "@/lib/domain/categories";
import { SLUG_TO_CATEGORY } from "@/lib/domain/categories";
import {
  loadProgress,
  type EvergreenCategory,
} from "@/lib/storage/local-progress";
import { track } from "@/lib/analytics/track";

const STEPS: Step[] = [1, 2, 3, 4, 5];

export function StepList({ slug }: { slug: EvergreenSlug }) {
  const category = SLUG_TO_CATEGORY[slug] as EvergreenCategory;
  const [unlockedStep, setUnlockedStep] = useState<number | null>(null);
  const [bestByStep, setBestByStep] = useState<Record<number, number>>({});
  const viewTracked = useRef(false);

  useEffect(() => {
    const progress = loadProgress();
    setUnlockedStep(progress.stepUnlocks[category]);
    const best: Record<number, number> = {};
    for (const session of progress.sessions) {
      if (
        session.kind === "step" &&
        session.category === category &&
        session.step !== undefined &&
        session.completedAt
      ) {
        const correct = session.answers.filter((a) => a.isCorrect).length;
        best[session.step] = Math.max(best[session.step] ?? 0, correct);
      }
    }
    setBestByStep(best);
    if (!viewTracked.current) {
      viewTracked.current = true;
      track("learn_category_view", { category });
    }
  }, [category]);

  return (
    <ol className="mt-4 space-y-3">
      {STEPS.map((step) => {
        const unlocked = unlockedStep !== null && step <= unlockedStep;
        const best = bestByStep[step];
        return (
          <li key={step}>
            {unlocked ? (
              <Link
                href={`/quiz/${slug}/step/${step}`}
                className="flex min-h-[56px] items-center justify-between rounded-2xl border border-line bg-background p-4 transition-colors duration-150 hover:border-accent"
              >
                <span>
                  <span className="block font-bold">STEP {step}</span>
                  <span className="block text-xs text-muted">
                    {best !== undefined
                      ? `クリア済み ベスト ${best}/5・もう一度挑戦できます`
                      : "5問に挑戦"}
                  </span>
                </span>
                <span aria-hidden className="text-accent">
                  →
                </span>
              </Link>
            ) : (
              <div
                aria-disabled="true"
                className="flex min-h-[56px] items-center justify-between rounded-2xl border border-line bg-surface p-4 opacity-70"
              >
                <span>
                  <span className="block font-bold text-muted">
                    STEP {step}（ロック中）
                  </span>
                  <span className="block text-xs text-muted">
                    STEP {step - 1}で4問以上正解すると解放
                  </span>
                </span>
                <span aria-hidden className="text-muted">
                  🔒
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
