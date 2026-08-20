import type { Question } from "@/lib/domain/types";
import type { ProgressState } from "@/lib/storage/local-progress";
import { getDueReviewItems } from "./scheduler";

/** Maximum questions per review session to keep it short. */
export const MAX_REVIEW_QUESTIONS = 10;

/**
 * Builds today's review question list from the due queue.
 * Oldest due items come first; entries whose question no longer exists in
 * content are skipped without breaking the queue.
 */
export function buildReviewQuestions(
  progress: ProgressState,
  allQuestions: Question[],
  todayKey: string,
): Question[] {
  const due = getDueReviewItems(progress.reviewQueue, todayKey);
  const byId = new Map(allQuestions.map((q) => [q.id, q]));
  const seen = new Set<string>();
  const questions: Question[] = [];
  const sorted = [...due].sort((a, b) =>
    a.dueDateKey.localeCompare(b.dueDateKey),
  );
  for (const item of sorted) {
    if (seen.has(item.questionId)) continue;
    seen.add(item.questionId);
    const question = byId.get(item.questionId);
    if (!question) continue;
    questions.push(question);
    if (questions.length >= MAX_REVIEW_QUESTIONS) break;
  }
  return questions;
}
