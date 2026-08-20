"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ScoreCard } from "./ScoreCard";
import { ReviewCard } from "./ReviewCard";
import { DailyPollCard } from "./DailyPollCard";
import { DailyQuizCard } from "./DailyQuizCard";
import {
  loadProgress,
  type ProgressState,
} from "@/lib/storage/local-progress";
import {
  calculateCategoryScores,
  calculateOverallWorkIq,
  getScoreState,
} from "@/lib/scoring/work-iq";
import { getDueReviewItems } from "@/lib/review/scheduler";
import { addDaysToDateKey, getJstDateKey } from "@/lib/time/jst";
import { track } from "@/lib/analytics/track";

const CATEGORY_LINKS = [
  { href: "/learn/business-terms", label: "ビジネス用語", note: "略語・カタカナ語" },
  { href: "/learn/judgment", label: "あなたならどうする？", note: "実務の判断力" },
  { href: "/learn/risk", label: "リスク管理", note: "初動と再発防止" },
] as const;

export function HomeScreen({ hasFreshNews }: { hasFreshNews: boolean }) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    setProgress(loadProgress());
    if (!viewTracked.current) {
      viewTracked.current = true;
      track("landing_view");
    }
  }, []);

  const todayKey = getJstDateKey();
  const yesterdayKey = addDaysToDateKey(todayKey, -1);

  const categoryScores = progress
    ? calculateCategoryScores(progress.answerHistory)
    : [];
  const overall = progress ? calculateOverallWorkIq(categoryScores) : null;
  const scoreState = progress ? getScoreState(progress.answerHistory) : "measuring";

  const todaysDaily = progress?.sessions.find(
    (s) => s.kind === "daily" && s.dateKey === todayKey && s.completedAt,
  );

  const dueItems = progress
    ? getDueReviewItems(progress.reviewQueue, todayKey)
    : [];
  const yesterdaySessions =
    progress?.sessions.filter(
      (s) => s.dateKey === yesterdayKey && s.completedAt && s.kind !== "review",
    ) ?? [];
  const yesterdayScore =
    yesterdaySessions.length > 0
      ? (yesterdaySessions[yesterdaySessions.length - 1].sessionScore ?? null)
      : null;
  const yesterdayMissed =
    progress?.answerHistory.filter(
      (a) => a.dateKey === yesterdayKey && !a.isCorrect,
    ).length ?? 0;

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between pt-2">
        <p className="text-2xl font-bold tracking-tight">
          WORK<span className="text-accent"> IQ</span>
        </p>
        <p className="text-xs text-muted">社会人力を、毎日5問で。</p>
      </header>

      <ScoreCard
        overall={overall}
        scoreState={scoreState}
        streak={progress?.streak.current ?? 0}
      />

      {progress && dueItems.length > 0 ? (
        <ReviewCard
          dueCount={dueItems.length}
          yesterdayScore={yesterdayScore}
          yesterdayMissedCount={yesterdayMissed}
        />
      ) : null}

      <DailyPollCard
        hasVoted={(pollId) => Boolean(progress?.pollVotes[pollId])}
      />

      <DailyQuizCard
        completedToday={Boolean(todaysDaily)}
        todaysScore={todaysDaily?.sessionScore ?? null}
        todaysSessionId={todaysDaily?.id ?? null}
      />

      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="mb-2 text-base font-bold">
          ジャンルから選ぶ
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {CATEGORY_LINKS.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex min-h-[56px] items-center justify-between rounded-2xl border border-line bg-background p-4 transition-colors duration-150 hover:border-accent"
            >
              <span>
                <span className="block font-semibold">{cat.label}</span>
                <span className="block text-xs text-muted">{cat.note}</span>
              </span>
              <span aria-hidden className="text-muted">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Card>
        <h2 className="text-base font-bold">今日の時事</h2>
        {hasFreshNews ? (
          <>
            <p className="mt-1 text-sm text-muted">
              最新のビジネスニュースから5問。
            </p>
            <ButtonLink
              href="/quiz/current-affairs"
              variant="secondary"
              className="mt-3 w-full"
            >
              今日の時事5問へ
            </ButtonLink>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">
            今日の時事問題は更新準備中です。
          </p>
        )}
      </Card>

      <footer className="flex justify-center gap-6 pb-2 pt-4 text-xs text-muted">
        <Link href="/about" className="underline-offset-2 hover:underline">
          WORK IQについて
        </Link>
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          プライバシー
        </Link>
      </footer>
    </div>
  );
}
