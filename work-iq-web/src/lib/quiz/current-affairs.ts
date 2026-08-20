import type { CurrentAffairsBatch, Question } from "@/lib/domain/types";

/**
 * A batch is fresh only when its batchDate is today's JST date.
 * Older batches are never surfaced as 「今日」 — the UI shows
 * 「今日の時事問題は更新準備中です。」 instead.
 */
export function getFreshCurrentAffairs(
  batches: CurrentAffairsBatch[],
  todayKey: string,
): Question[] {
  const todayBatch = batches.find((batch) => batch.batchDate === todayKey);
  if (!todayBatch) return [];
  return todayBatch.questions.filter((q) => q.source !== undefined);
}

/** True when a fresh batch exists for today's JST date. */
export function hasFreshCurrentAffairs(
  batches: CurrentAffairsBatch[],
  todayKey: string,
): boolean {
  return getFreshCurrentAffairs(batches, todayKey).length > 0;
}
