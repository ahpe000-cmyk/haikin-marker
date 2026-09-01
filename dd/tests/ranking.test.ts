import { describe, expect, it } from "vitest";
import { buildRanking, rankingMax, rankingScore } from "@/lib/ranking";
import { PLANS } from "@/data/plans";

describe("ranking", () => {
  it("gives the max score components to the top plan of each metric", () => {
    const stats = [
      { rating: 5, saveCount: 100, reproduceCount: 50, reviewCount: 10 },
      { rating: 2.5, saveCount: 50, reproduceCount: 25, reviewCount: 5 },
    ];
    const max = rankingMax(stats);
    expect(max).toEqual({ maxSave: 100, maxReproduce: 50, maxReview: 10 });
    // 全指標で1位のプランは満点 30+35+25+10=100
    expect(rankingScore(stats[0], max)).toBe(100);
    // 全指標で半分のプランは 15+17.5+12.5+5=50
    expect(rankingScore(stats[1], max)).toBe(50);
  });

  it("treats zero denominators as zero contribution", () => {
    const stats = { rating: 5, saveCount: 0, reproduceCount: 0, reviewCount: 0 };
    const max = rankingMax([stats]);
    expect(rankingScore(stats, max)).toBe(30);
  });

  it("sorts the overall tab by score descending with sequential ranks", () => {
    const entries = buildRanking(PLANS, "overall");
    expect(entries).toHaveLength(PLANS.length);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].score).toBeGreaterThanOrEqual(entries[i].score);
      expect(entries[i].rank).toBe(i + 1);
    }
  });

  it("sorts the save/reproduce/rating tabs by their own metric", () => {
    const bySave = buildRanking(PLANS, "save");
    for (let i = 1; i < bySave.length; i++) {
      expect(bySave[i - 1].plan.saveCount).toBeGreaterThanOrEqual(
        bySave[i].plan.saveCount,
      );
    }
    const byReproduce = buildRanking(PLANS, "reproduce");
    for (let i = 1; i < byReproduce.length; i++) {
      expect(byReproduce[i - 1].plan.reproduceCount).toBeGreaterThanOrEqual(
        byReproduce[i].plan.reproduceCount,
      );
    }
    const byRating = buildRanking(PLANS, "rating");
    for (let i = 1; i < byRating.length; i++) {
      expect(byRating[i - 1].plan.rating).toBeGreaterThanOrEqual(
        byRating[i].plan.rating,
      );
    }
  });
});
