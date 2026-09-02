import { describe, expect, it } from "vitest";
import {
  calcCreatorScore,
  calcDateScore,
  calcFeedScore,
  calcRisingScore,
} from "@/lib/score";

describe("calcCreatorScore", () => {
  it("returns 0 for an empty creator", () => {
    expect(
      calcCreatorScore({
        totalReproductions: 0,
        totalSavesGenerated: 0,
        averageRating: 0,
        engagement: 0,
        postCount: 0,
      })
    ).toBe(0);
  });

  it("caps at 100", () => {
    const score = calcCreatorScore({
      totalReproductions: 10000,
      totalSavesGenerated: 10000,
      averageRating: 5,
      engagement: 1000000,
      postCount: 1000,
    });
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThan(90);
  });

  it("weights reproductions more than followers (engagement)", () => {
    const reproHeavy = calcCreatorScore({
      totalReproductions: 400,
      totalSavesGenerated: 1000,
      averageRating: 4.5,
      engagement: 1000,
      postCount: 20,
    });
    const followerHeavy = calcCreatorScore({
      totalReproductions: 20,
      totalSavesGenerated: 1000,
      averageRating: 4.5,
      engagement: 20000,
      postCount: 20,
    });
    expect(reproHeavy).toBeGreaterThan(followerHeavy);
  });
});

describe("calcDateScore", () => {
  const now = new Date("2026-09-02T12:00:00+09:00").getTime();

  it("ranks a heavily reproduced date above a lightly reproduced one", () => {
    const strong = calcDateScore({
      reproductionCount: 438,
      saveCount: 2913,
      rating: 4.8,
      commentsCount: 132,
      createdAt: "2026-08-28T21:40:00+09:00",
      now,
    });
    const weak = calcDateScore({
      reproductionCount: 66,
      saveCount: 780,
      rating: 4.4,
      commentsCount: 35,
      createdAt: "2026-08-07T23:30:00+09:00",
      now,
    });
    expect(strong).toBeGreaterThan(weak);
  });

  it("gives fresher dates a freshness bonus, all else equal", () => {
    const base = {
      reproductionCount: 100,
      saveCount: 1000,
      rating: 4.5,
      commentsCount: 50,
      now,
    };
    const fresh = calcDateScore({ ...base, createdAt: "2026-09-01T00:00:00+09:00" });
    const stale = calcDateScore({ ...base, createdAt: "2026-05-01T00:00:00+09:00" });
    expect(fresh).toBeGreaterThan(stale);
  });
});

describe("calcFeedScore", () => {
  const now = new Date("2026-09-02T12:00:00+09:00").getTime();

  it("prioritizes reproduction-heavy posts", () => {
    const reproPost = calcFeedScore({
      reproductionsCount: 400,
      savesCount: 500,
      likesCount: 1000,
      commentsCount: 50,
      createdAt: "2026-08-25T12:00:00+09:00",
      now,
    });
    const likeOnlyPost = calcFeedScore({
      reproductionsCount: 0,
      savesCount: 500,
      likesCount: 8000,
      commentsCount: 50,
      createdAt: "2026-08-25T12:00:00+09:00",
      now,
    });
    expect(reproPost).toBeGreaterThan(likeOnlyPost);
  });
});

describe("calcRisingScore", () => {
  it("boosts small accounts with high reproduction-per-date efficiency", () => {
    const smallEfficient = calcRisingScore({
      totalReproductions: 180,
      dateCount: 6,
      followers: 2000,
    });
    const bigInefficient = calcRisingScore({
      totalReproductions: 200,
      dateCount: 19,
      followers: 25000,
    });
    expect(smallEfficient).toBeGreaterThan(bigInefficient);
  });

  it("returns 0 for creators with no dates", () => {
    expect(
      calcRisingScore({ totalReproductions: 10, dateCount: 0, followers: 100 })
    ).toBe(0);
  });
});
