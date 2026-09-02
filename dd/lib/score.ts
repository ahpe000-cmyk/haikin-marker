/**
 * DD demo scoring algorithms.
 *
 * これらはすべて「デモ用アルゴリズム」であり、本番の推薦・評価ロジックではない。
 * README の "Demo Algorithms" セクションにも同内容を明記している。
 *
 * 設計方針:
 * - Follower数を主軸にしない（既存SNSインフルエンサーのランキング独占を防ぐ）
 * - DD内部で実際に価値を生んだ行動 = 再現(Reproduction) を最重要視する
 */

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Normalize a raw value against a demo-scale ceiling into 0..1. */
function norm(value: number, ceiling: number): number {
  return clamp01(value / ceiling);
}

export interface CreatorScoreInput {
  totalReproductions: number;
  totalSavesGenerated: number;
  averageRating: number;
  /** Engagement proxy (likes + comments received). Demo: rough estimate. */
  engagement: number;
  postCount: number;
}

/**
 * Creator DD Score (0-100).
 *
 * Demo formula per spec §72:
 * - Reproduction contribution ........ 40%
 * - Save → Reproduction conversion ... 20%
 * - Average reproduction rating ...... 20%
 * - Engagement ....................... 10%
 * - Posting consistency .............. 10%
 */
export function calcCreatorScore(input: CreatorScoreInput): number {
  const reproduction = norm(input.totalReproductions, 500);
  const conversion = clamp01(
    input.totalSavesGenerated > 0
      ? input.totalReproductions / input.totalSavesGenerated / 0.4
      : 0
  );
  const rating = clamp01(input.averageRating / 5);
  const engagement = norm(input.engagement, 20000);
  const consistency = norm(input.postCount, 30);

  const score =
    reproduction * 40 +
    conversion * 20 +
    rating * 20 +
    engagement * 10 +
    consistency * 10;

  return Math.round(score * 10) / 10;
}

export interface DateScoreInput {
  reproductionCount: number;
  saveCount: number;
  rating: number;
  commentsCount: number;
  /** ISO createdAt of the linked post. */
  createdAt: string;
  now?: number;
}

/**
 * Date Score (0-100).
 *
 * Demo formula per spec §74:
 * - Normalized Reproductions × 40
 * - Normalized Saves × 25
 * - Rating × 20
 * - Normalized Comments × 10
 * - Freshness × 5
 */
export function calcDateScore(input: DateScoreInput): number {
  const now = input.now ?? Date.now();
  const ageDays = Math.max(0, (now - new Date(input.createdAt).getTime()) / 86400000);
  const freshness = clamp01(1 - ageDays / 90);

  const score =
    norm(input.reproductionCount, 500) * 40 +
    norm(input.saveCount, 3000) * 25 +
    clamp01(input.rating / 5) * 20 +
    norm(input.commentsCount, 200) * 10 +
    freshness * 5;

  return Math.round(score * 10) / 10;
}

export interface FeedScoreInput {
  reproductionsCount: number;
  savesCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  now?: number;
}

/**
 * Home Feed score (0-100) — order of the「おすすめ」feed.
 *
 * Demo formula per spec §75:
 * - Reproduction ... 40%
 * - Save ........... 25%
 * - Engagement ..... 20%
 * - Freshness ...... 15%
 */
export function calcFeedScore(input: FeedScoreInput): number {
  const now = input.now ?? Date.now();
  const ageDays = Math.max(0, (now - new Date(input.createdAt).getTime()) / 86400000);
  const freshness = clamp01(1 - ageDays / 30);

  const score =
    norm(input.reproductionsCount, 500) * 40 +
    norm(input.savesCount, 3000) * 25 +
    norm(input.likesCount + input.commentsCount * 3, 20000) * 20 +
    freshness * 15;

  return Math.round(score * 100) / 100;
}

export interface RisingScoreInput {
  totalReproductions: number;
  dateCount: number;
  followers: number;
}

/**
 * Rising Creator score — momentum heuristic for the Rising ranking tab.
 * Rewards reproduction-per-date efficiency and dampens already-large accounts,
 * so that small but effective creators can surface. Demo only.
 */
export function calcRisingScore(input: RisingScoreInput): number {
  const perDate = input.dateCount > 0 ? input.totalReproductions / input.dateCount : 0;
  const smallness = clamp01(1 - input.followers / 30000);
  return Math.round(perDate * (0.4 + smallness * 0.6) * 10) / 10;
}
