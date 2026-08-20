"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Category, Question, QuizSession } from "@/lib/domain/types";
import { useProgress } from "@/lib/storage/use-progress";
import {
  SCORE_STATE_LABELS,
  calculateCategoryScores,
  calculateOverallWorkIq,
  getScoreState,
} from "@/lib/scoring/work-iq";
import { CATEGORY_LABELS } from "@/lib/domain/categories";
import { selectCta } from "@/lib/cta/select-cta";
import { track } from "@/lib/analytics/track";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { SessionScore } from "./SessionScore";
import { ShareButton } from "./ShareButton";
import { ScoreDisclaimer } from "@/components/progress/ScoreDisclaimer";
import { ServiceCta } from "@/components/cta/ServiceCta";
import { isStepPassed } from "@/lib/quiz/session";
import { CATEGORY_TO_SLUG } from "@/lib/domain/categories";

const KIND_LABELS: Record<QuizSession["kind"], string> = {
  daily: "今日の5問",
  step: "STEPチャレンジ",
  current_affairs: "今日の時事",
  review: "復習",
};

function dominantCategory(session: QuizSession): Category | undefined {
  const counts = new Map<Category, number>();
  for (const answer of session.answers) {
    counts.set(answer.category, (counts.get(answer.category) ?? 0) + 1);
  }
  let best: Category | undefined;
  let bestCount = 0;
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

export function ResultScreen({
  sessionId,
  allQuestions,
}: {
  sessionId: string;
  allQuestions: Question[];
}) {
  const progress = useProgress();
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      track("result_view", { sessionId });
    }
  }, [sessionId]);

  if (progress === null) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }

  const session = progress?.sessions.find((s) => s.id === sessionId);

  if (!progress || !session) {
    // Shared link opened on another device: generic challenge landing.
    return (
      <div className="space-y-4 py-6 text-center">
        <p className="text-2xl font-bold tracking-tight">
          WORK<span className="text-accent"> IQ</span>
        </p>
        <h1 className="text-lg font-bold">あなたの社会人力、何点？</h1>
        <p className="text-sm leading-relaxed text-muted">
          この結果は挑戦した本人の端末にのみ保存されています。
          <br />
          あなたも今日の5問に挑戦して、自分のスコアを確かめてみませんか。
        </p>
        <ButtonLink href="/quiz/daily" className="w-full">
          今日の5問に挑戦
        </ButtonLink>
        <Card className="text-left">
          <ScoreDisclaimer />
        </Card>
      </div>
    );
  }

  const questionById = new Map(allQuestions.map((q) => [q.id, q]));
  const wrongAnswers = session.answers.filter((a) => !a.isCorrect);
  const categoryScores = calculateCategoryScores(progress.answerHistory);
  const overall = calculateOverallWorkIq(categoryScores);
  const scoreState = getScoreState(progress.answerHistory);
  const sessionCategories = [...new Set(session.answers.map((a) => a.category))];
  const cta = selectCta({
    surface: "result",
    category: dominantCategory(session),
  });

  const stepInfo =
    session.kind === "step" && session.category && session.step !== undefined
      ? { passed: isStepPassed(session), category: session.category, step: session.step }
      : null;

  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-xl font-bold">結果</h1>

      <SessionScore
        score={session.sessionScore ?? 0}
        correctCount={session.answers.filter((a) => a.isCorrect).length}
        totalCount={session.answers.length}
        kindLabel={KIND_LABELS[session.kind]}
      />

      {stepInfo ? (
        <Card>
          {stepInfo.passed ? (
            <p className="text-sm font-semibold text-success">
              クリア！{stepInfo.step < 5 ? `STEP ${stepInfo.step + 1}が解放されました。` : "ビギナーコースを完走しました。"}
            </p>
          ) : (
            <p className="text-sm text-muted">
              あと少し。4問以上正解で次のSTEPが解放されます。もう一度挑戦できます。
            </p>
          )}
        </Card>
      ) : null}

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-muted">
            {scoreState === "work_iq"
              ? "現在のWORK IQ"
              : `現在のスコア（${SCORE_STATE_LABELS[scoreState]}）`}
          </p>
          <p className="text-3xl font-bold tabular-nums">{overall ?? "—"}</p>
        </div>
        <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          {categoryScores
            .filter((c) => sessionCategories.includes(c.category))
            .map((c) => (
              <li key={c.category} className="flex justify-between">
                <span>{CATEGORY_LABELS[c.category]}</span>
                <span className="font-semibold tabular-nums">{c.score}</span>
              </li>
            ))}
        </ul>
        <div className="mt-3 border-t border-line pt-3">
          <ScoreDisclaimer />
        </div>
      </Card>

      {wrongAnswers.length > 0 ? (
        <Card>
          <h2 className="text-sm font-bold">今日の学びポイント</h2>
          <ul className="mt-2 space-y-3">
            {wrongAnswers.map((answer) => {
              const question = questionById.get(answer.questionId);
              if (!question) return null;
              return (
                <li key={answer.questionId} className="text-sm">
                  <p className="font-semibold">{question.prompt}</p>
                  <p className="mt-1 text-muted">{question.explanation}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 border-t border-line pt-2 text-xs text-muted">
            間違えた問題は明日の復習に登場します。
          </p>
        </Card>
      ) : null}

      <ShareButton
        score={session.sessionScore ?? 0}
        scoreState={scoreState}
        sessionId={session.id}
      />

      {cta ? <ServiceCta selection={cta} /> : null}

      <div className="flex gap-2 pb-4">
        <ButtonLink href="/" variant="secondary" className="flex-1">
          ホームへ
        </ButtonLink>
        {stepInfo && !stepInfo.passed ? (
          <ButtonLink
            href={`/quiz/${CATEGORY_TO_SLUG[stepInfo.category]}/step/${stepInfo.step}`}
            className="flex-1"
          >
            もう一度挑戦
          </ButtonLink>
        ) : (
          <ButtonLink href="/learn" variant="ghost" className="flex-1">
            他のジャンルへ
          </ButtonLink>
        )}
      </div>

      <div className="pb-2 text-center">
        <Link href="/privacy" className="text-xs text-muted underline-offset-2 hover:underline">
          プライバシー
        </Link>
      </div>
    </div>
  );
}
