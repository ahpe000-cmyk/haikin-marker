import type { Metadata } from "next";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ButtonLink } from "@/components/ui/Button";
import { loadCurrentAffairsBatches } from "@/lib/content/load";
import { getFreshCurrentAffairs } from "@/lib/quiz/current-affairs";
import { getJstDateKey } from "@/lib/time/jst";

export const metadata: Metadata = {
  title: "今日の時事",
};

export const dynamic = "force-dynamic";

export default function CurrentAffairsQuizPage() {
  const fresh = getFreshCurrentAffairs(
    loadCurrentAffairsBatches(),
    getJstDateKey(),
  );

  if (fresh.length === 0) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-lg font-bold">今日の時事問題は更新準備中です。</h1>
        <p className="mt-2 text-sm text-muted">
          検証済みの最新ニュースが揃い次第、ここに表示されます。
        </p>
        <ButtonLink href="/quiz/daily" variant="secondary" className="mt-4">
          今日の5問に挑戦する
        </ButtonLink>
      </div>
    );
  }

  return (
    <QuizRunner
      questions={fresh.slice(0, 5)}
      kind="current_affairs"
      category="current_affairs"
    />
  );
}
