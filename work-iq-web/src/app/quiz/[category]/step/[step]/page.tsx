import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StepQuizGate } from "@/components/quiz/StepQuizGate";
import {
  CATEGORY_LABELS,
  SLUG_TO_CATEGORY,
  isEvergreenSlug,
} from "@/lib/domain/categories";
import type { Step } from "@/lib/domain/types";
import { loadEvergreenQuestions } from "@/lib/content/load";
import { getStepQuestions } from "@/lib/quiz/select-questions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; step: string }>;
}): Promise<Metadata> {
  const { category, step } = await params;
  if (!isEvergreenSlug(category)) return {};
  return {
    title: `${CATEGORY_LABELS[SLUG_TO_CATEGORY[category]]} STEP ${step}`,
  };
}

export default async function StepQuizPage({
  params,
}: {
  params: Promise<{ category: string; step: string }>;
}) {
  const { category, step: stepParam } = await params;
  const stepNumber = Number(stepParam);
  if (
    !isEvergreenSlug(category) ||
    !Number.isInteger(stepNumber) ||
    stepNumber < 1 ||
    stepNumber > 5
  ) {
    notFound();
  }
  const step = stepNumber as Step;
  const pools = loadEvergreenQuestions();
  const pool =
    category === "business-terms"
      ? pools.businessTerms
      : category === "judgment"
        ? pools.judgment
        : pools.risk;
  const questions = getStepQuestions(pool, SLUG_TO_CATEGORY[category], step);
  if (questions.length === 0) notFound();

  return <StepQuizGate slug={category} step={step} questions={questions} />;
}
