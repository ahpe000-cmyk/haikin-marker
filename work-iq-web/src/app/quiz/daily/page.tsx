import type { Metadata } from "next";
import { DailyQuizLoader } from "@/components/quiz/DailyQuizLoader";
import {
  loadCurrentAffairsBatches,
  loadEvergreenQuestions,
} from "@/lib/content/load";
import { getFreshCurrentAffairs } from "@/lib/quiz/current-affairs";
import { getJstDateKey } from "@/lib/time/jst";

export const metadata: Metadata = {
  title: "今日の5問",
};

export const dynamic = "force-dynamic";

export default function DailyQuizPage() {
  const { businessTerms, judgment, risk } = loadEvergreenQuestions();
  const currentAffairs = getFreshCurrentAffairs(
    loadCurrentAffairsBatches(),
    getJstDateKey(),
  );
  return (
    <DailyQuizLoader
      businessTerms={businessTerms}
      judgment={judgment}
      risk={risk}
      currentAffairs={currentAffairs}
    />
  );
}
