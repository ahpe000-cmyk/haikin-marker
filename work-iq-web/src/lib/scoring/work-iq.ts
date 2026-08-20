import type { Category, Question, SessionAnswer } from "@/lib/domain/types";
import type { StoredAnswerRecord } from "@/lib/storage/local-progress";

/** Question weights defined by the design spec. */
export const WEIGHT_FACTUAL = 1.0;
export const WEIGHT_USAGE_TIMING = 1.1;
export const WEIGHT_BEST_ANSWER = 1.25;

/** Most recent scored answers per category considered for displayed scores. */
export const MAX_SCORED_HISTORY_PER_CATEGORY = 100;

export type ScoreState = "measuring" | "provisional" | "work_iq";

export const SCORE_STATE_LABELS: Record<ScoreState, string> = {
  measuring: "測定中",
  provisional: "仮測定",
  work_iq: "WORK IQ",
};

/**
 * Determines the weight of a scored question:
 * best-answer judgment 1.25, usage/timing 1.10, factual knowledge 1.00.
 * Poll questions are never scored and never reach this function.
 */
export function questionWeight(question: Pick<Question, "mode" | "tags">): number {
  if (question.mode === "best_answer") return WEIGHT_BEST_ANSWER;
  if (question.tags.includes("usage") || question.tags.includes("timing")) {
    return WEIGHT_USAGE_TIMING;
  }
  return WEIGHT_FACTUAL;
}

/** Session score: round(100 * earned weighted points / available weighted points). */
export function calculateSessionScore(
  answers: Pick<SessionAnswer, "isCorrect" | "weight">[],
): number {
  const available = answers.reduce((sum, a) => sum + a.weight, 0);
  if (available === 0) return 0;
  const earned = answers.reduce(
    (sum, a) => sum + (a.isCorrect ? a.weight : 0),
    0,
  );
  return Math.round((100 * earned) / available);
}

export interface CategoryScore {
  category: Category;
  score: number;
  answeredCount: number;
  weightTotal: number;
}

/**
 * Weighted accuracy per category over the most recent
 * MAX_SCORED_HISTORY_PER_CATEGORY stored answers.
 */
export function calculateCategoryScores(
  history: StoredAnswerRecord[],
): CategoryScore[] {
  const byCategory = new Map<Category, StoredAnswerRecord[]>();
  for (const record of history) {
    const list = byCategory.get(record.category) ?? [];
    list.push(record);
    byCategory.set(record.category, list);
  }
  const scores: CategoryScore[] = [];
  for (const [category, records] of byCategory) {
    const recent = records.slice(-MAX_SCORED_HISTORY_PER_CATEGORY);
    const weightTotal = recent.reduce((sum, r) => sum + r.weight, 0);
    if (weightTotal === 0) continue;
    const earned = recent.reduce(
      (sum, r) => sum + (r.isCorrect ? r.weight : 0),
      0,
    );
    scores.push({
      category,
      score: Math.round((100 * earned) / weightTotal),
      answeredCount: recent.length,
      weightTotal,
    });
  }
  return scores;
}

/**
 * Overall WORK IQ: weighted mean of category scores for categories with
 * answered questions, weighted by each category's scored weight total.
 * Never produces a percentile.
 */
export function calculateOverallWorkIq(
  categoryScores: CategoryScore[],
): number | null {
  const answered = categoryScores.filter((c) => c.answeredCount > 0);
  if (answered.length === 0) return null;
  const totalWeight = answered.reduce((sum, c) => sum + c.weightTotal, 0);
  if (totalWeight === 0) return null;
  const weighted = answered.reduce(
    (sum, c) => sum + c.score * c.weightTotal,
    0,
  );
  return Math.round(weighted / totalWeight);
}

/**
 * Score display state:
 * 0–4 scored answers → 測定中, 5–14 → 仮測定,
 * 15+ across at least 2 categories → WORK IQ.
 */
export function getScoreState(history: StoredAnswerRecord[]): ScoreState {
  const total = history.length;
  const categories = new Set(history.map((r) => r.category)).size;
  if (total >= 15 && categories >= 2) return "work_iq";
  if (total >= 5) return "provisional";
  return "measuring";
}
