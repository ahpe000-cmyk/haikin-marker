import type { Category } from "@/lib/domain/types";
import type { ReviewItem } from "@/lib/storage/local-progress";
import { addDaysToDateKey } from "@/lib/time/jst";

/** Spaced review intervals in days: 1 → 3 → 7 → 30. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 30] as const;

/**
 * Registers a wrong scored answer: due for review the next day.
 * An existing queue entry for the question is reset instead of duplicated.
 */
export function addWrongAnswer(
  queue: ReviewItem[],
  questionId: string,
  category: Category,
  todayKey: string,
): ReviewItem[] {
  const rest = queue.filter((item) => item.questionId !== questionId);
  return [
    ...rest,
    {
      questionId,
      category,
      intervalIndex: 0,
      dueDateKey: addDaysToDateKey(todayKey, REVIEW_INTERVALS_DAYS[0]),
      addedDateKey: todayKey,
    },
  ];
}

/**
 * Applies a review answer:
 * correct → advance to the next interval (removed after clearing 30 days),
 * wrong → reset to the 1-day interval.
 */
export function applyReviewAnswer(
  queue: ReviewItem[],
  questionId: string,
  isCorrect: boolean,
  todayKey: string,
): ReviewItem[] {
  const item = queue.find((entry) => entry.questionId === questionId);
  if (!item) return queue;
  const rest = queue.filter((entry) => entry.questionId !== questionId);

  if (!isCorrect) {
    return [
      ...rest,
      {
        ...item,
        intervalIndex: 0,
        dueDateKey: addDaysToDateKey(todayKey, REVIEW_INTERVALS_DAYS[0]),
      },
    ];
  }

  const nextIndex = item.intervalIndex + 1;
  if (nextIndex >= REVIEW_INTERVALS_DAYS.length) {
    // Cleared the 30-day review: graduate out of the queue.
    return rest;
  }
  return [
    ...rest,
    {
      ...item,
      intervalIndex: nextIndex,
      dueDateKey: addDaysToDateKey(todayKey, REVIEW_INTERVALS_DAYS[nextIndex]),
    },
  ];
}

/** Items due on or before the given JST date. */
export function getDueReviewItems(
  queue: ReviewItem[],
  todayKey: string,
): ReviewItem[] {
  return queue.filter((item) => item.dueDateKey <= todayKey);
}
