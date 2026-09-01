import { describe, expect, it } from "vitest";
import {
  addPlan,
  addReview,
  beginReproduction,
  completeReproduction,
  effectiveStats,
  INITIAL_STATE,
  isFollowing,
  isSaved,
  reproduceProgress,
  startReproduction,
  toggleFollow,
  toggleSave,
  toggleStopComplete,
} from "@/lib/store";
import { PLAN_MAP } from "@/data/plans";
import type { DateReview } from "@/types";

const plan = PLAN_MAP["d1"];

describe("save state", () => {
  it("toggles save on and off", () => {
    let state = INITIAL_STATE;
    expect(isSaved(state, "d1")).toBe(false);
    state = toggleSave(state, "d1");
    expect(isSaved(state, "d1")).toBe(true);
    expect(effectiveStats(state, plan).saveCount).toBe(plan.saveCount + 1);
    state = toggleSave(state, "d1");
    expect(isSaved(state, "d1")).toBe(false);
    expect(effectiveStats(state, plan).saveCount).toBe(plan.saveCount);
  });
});

describe("follow state", () => {
  it("toggles follow on and off", () => {
    let state = INITIAL_STATE;
    state = toggleFollow(state, "c1");
    expect(isFollowing(state, "c1")).toBe(true);
    state = toggleFollow(state, "c1");
    expect(isFollowing(state, "c1")).toBe(false);
  });
});

describe("reproduce progress", () => {
  it("walks through planned → in-progress → completed", () => {
    let state = beginReproduction(INITIAL_STATE, "d1");
    expect(state.reproductions["d1"].status).toBe("planned");

    // 開始前はチェックできない
    state = toggleStopComplete(state, "d1", "d1-s1");
    expect(state.reproductions["d1"].completedStopIds).toHaveLength(0);

    state = startReproduction(state, "d1");
    expect(state.reproductions["d1"].status).toBe("in-progress");

    state = toggleStopComplete(state, "d1", "d1-s1");
    state = toggleStopComplete(state, "d1", "d1-s2");
    const progress = reproduceProgress(
      state.reproductions["d1"],
      plan.stops.length,
    );
    expect(progress).toEqual({ done: 2, total: 4, percent: 50 });

    // チェックの取り消しもできる
    state = toggleStopComplete(state, "d1", "d1-s2");
    expect(state.reproductions["d1"].completedStopIds).toEqual(["d1-s1"]);

    state = completeReproduction(state, "d1");
    expect(state.reproductions["d1"].status).toBe("completed");
    expect(effectiveStats(state, plan).reproduceCount).toBe(
      plan.reproduceCount + 1,
    );
  });

  it("does not complete a reproduction that was never started", () => {
    let state = beginReproduction(INITIAL_STATE, "d1");
    state = completeReproduction(state, "d1");
    expect(state.reproductions["d1"].status).toBe("planned");
  });
});

describe("reviews", () => {
  it("adds a review, marks reproduction reviewed and updates rating", () => {
    let state = beginReproduction(INITIAL_STATE, "d1");
    state = startReproduction(state, "d1");
    state = completeReproduction(state, "d1");
    const review: DateReview = {
      id: "t1",
      planId: "d1",
      authorName: "tester",
      overall: 3,
      atmosphere: 4,
      costPerformance: 4,
      reproducibility: 5,
      wouldUseAgain: true,
      comment: "",
      createdAt: "2026-09-01",
    };
    state = addReview(state, review);
    expect(state.myReviews).toHaveLength(1);
    expect(state.reproductions["d1"].reviewed).toBe(true);
    const stats = effectiveStats(state, plan);
    expect(stats.reviewCount).toBe(plan.reviewCount + 1);
    // 加重平均（小数第1位に丸め）で再計算される
    const expected =
      Math.round(
        ((plan.rating * plan.reviewCount + review.overall) /
          (plan.reviewCount + 1)) *
          10,
      ) / 10;
    expect(stats.rating).toBe(expected);
  });
});

describe("user posts", () => {
  it("prepends a created plan", () => {
    const state = addPlan(INITIAL_STATE, { ...plan, id: "my-1" });
    expect(state.myPlans[0].id).toBe("my-1");
  });
});
