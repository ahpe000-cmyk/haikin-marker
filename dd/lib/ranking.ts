import type { DatePlan, RankingEntry, RankingTab } from "@/types";

// Demo ranking algorithm（本番アルゴリズムではありません）
//
//   Ranking Score =
//     (rating / 5)                × 30
//   + (reproduceCount / max再現数) × 35
//   + (saveCount / max保存数)      × 25
//   + (reviewCount / max評価数)    × 10
//
// 「実際に使われている（再現されている）デート」を最も重く評価する。
// 分母が 0 の場合はその項を 0 とする。

export interface PlanStats {
  rating: number;
  saveCount: number;
  reproduceCount: number;
  reviewCount: number;
}

export interface RankingMax {
  maxSave: number;
  maxReproduce: number;
  maxReview: number;
}

export function rankingMax(stats: PlanStats[]): RankingMax {
  return {
    maxSave: Math.max(0, ...stats.map((s) => s.saveCount)),
    maxReproduce: Math.max(0, ...stats.map((s) => s.reproduceCount)),
    maxReview: Math.max(0, ...stats.map((s) => s.reviewCount)),
  };
}

function normalized(value: number, max: number): number {
  return max > 0 ? value / max : 0;
}

export function rankingScore(stats: PlanStats, max: RankingMax): number {
  const score =
    (stats.rating / 5) * 30 +
    normalized(stats.reproduceCount, max.maxReproduce) * 35 +
    normalized(stats.saveCount, max.maxSave) * 25 +
    normalized(stats.reviewCount, max.maxReview) * 10;
  return Math.round(score * 10) / 10;
}

export function buildRanking(
  plans: DatePlan[],
  tab: RankingTab,
  statsOf: (plan: DatePlan) => PlanStats = (p) => p,
): RankingEntry[] {
  const stats = plans.map(statsOf);
  const max = rankingMax(stats);
  const scored = plans.map((plan, i) => ({
    plan,
    stats: stats[i],
    score: rankingScore(stats[i], max),
  }));

  const sorted = [...scored].sort((a, b) => {
    switch (tab) {
      case "save":
        return b.stats.saveCount - a.stats.saveCount;
      case "reproduce":
        return b.stats.reproduceCount - a.stats.reproduceCount;
      case "rating":
        return (
          b.stats.rating - a.stats.rating ||
          b.stats.reviewCount - a.stats.reviewCount
        );
      case "overall":
      default:
        return b.score - a.score;
    }
  });

  return sorted.map((s, i) => ({ plan: s.plan, score: s.score, rank: i + 1 }));
}
