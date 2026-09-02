import { describe, expect, it } from "vitest";
import type { Comment, DateExperience, Post, Reproduction } from "@/types";
import {
  DEFAULT_FOLLOWING,
  initialState,
  isDateSaved,
  isFollowing,
  isLiked,
  isPostSaved,
  reducer,
  type DemoState,
} from "@/lib/state";

const mkPost = (id: string): Post => ({
  id,
  authorId: "u_me",
  authorType: "individual",
  type: "normal",
  caption: "test",
  media: [],
  likesCount: 0,
  commentsCount: 0,
  savesCount: 0,
  reproductionsCount: 0,
  isLiked: false,
  isSaved: false,
  createdAt: "2026-09-02T12:00:00+09:00",
});

describe("like state", () => {
  it("toggles like on and off", () => {
    let s = reducer(initialState, { type: "TOGGLE_LIKE", postId: "p1", baseLiked: false });
    expect(isLiked(s, "p1")).toBe(true);
    s = reducer(s, { type: "TOGGLE_LIKE", postId: "p1", baseLiked: false });
    expect(isLiked(s, "p1")).toBe(false);
  });
});

describe("save state", () => {
  it("saves and unsaves posts and dates independently", () => {
    let s = reducer(initialState, { type: "TOGGLE_SAVE_POST", postId: "p1" });
    s = reducer(s, { type: "TOGGLE_SAVE_DATE", dateId: "d1" });
    expect(isPostSaved(s, "p1")).toBe(true);
    expect(isDateSaved(s, "d1")).toBe(true);
    expect(isPostSaved(s, "p2")).toBe(false);

    s = reducer(s, { type: "TOGGLE_SAVE_DATE", dateId: "d1" });
    expect(isDateSaved(s, "d1")).toBe(false);
    expect(isPostSaved(s, "p1")).toBe(true);
  });
});

describe("follow state", () => {
  it("follows and unfollows", () => {
    let s = reducer(initialState, {
      type: "TOGGLE_FOLLOW",
      actorId: "c1",
      baseFollowing: false,
    });
    expect(isFollowing(s, "c1")).toBe(true);
    s = reducer(s, { type: "TOGGLE_FOLLOW", actorId: "c1", baseFollowing: false });
    expect(isFollowing(s, "c1")).toBe(false);
  });

  it("respects default following and allows unfollowing defaults", () => {
    const defaultId = DEFAULT_FOLLOWING[0];
    expect(isFollowing(initialState, defaultId)).toBe(true);
    const s = reducer(initialState, {
      type: "TOGGLE_FOLLOW",
      actorId: defaultId,
      baseFollowing: true,
    });
    expect(isFollowing(s, defaultId)).toBe(false);
  });
});

describe("comment creation", () => {
  it("appends comments per post", () => {
    const comment: Comment = {
      id: "cm1",
      postId: "p1",
      authorId: "u_me",
      text: "最高でした",
      createdAt: "2026-09-02T12:00:00+09:00",
    };
    const s = reducer(initialState, { type: "ADD_COMMENT", comment });
    expect(s.userComments["p1"]).toHaveLength(1);
    const s2 = reducer(s, {
      type: "ADD_COMMENT",
      comment: { ...comment, id: "cm2" },
    });
    expect(s2.userComments["p1"]).toHaveLength(2);
  });
});

describe("post creation", () => {
  it("prepends created posts", () => {
    let s = reducer(initialState, { type: "CREATE_POST", post: mkPost("pA") });
    s = reducer(s, { type: "CREATE_POST", post: mkPost("pB") });
    expect(s.createdPosts.map((p) => p.id)).toEqual(["pB", "pA"]);
  });

  it("stores an attached date experience", () => {
    const date: DateExperience = {
      id: "dX",
      postId: "pA",
      title: "テストデート",
      area: "銀座",
      budgetMin: 1000,
      budgetMax: 2000,
      durationMinutes: 120,
      scene: "casual",
      tags: [],
      timeline: [],
      tips: [],
      rating: 0,
      reviewCount: 0,
      saveCount: 0,
      reproductionCount: 0,
    };
    const s = reducer(initialState, { type: "CREATE_POST", post: mkPost("pA"), date });
    expect(s.createdDates[0].id).toBe("dX");
  });
});

describe("reproduction progress", () => {
  const start = (s: DemoState = initialState) =>
    reducer(s, {
      type: "START_REPRODUCTION",
      dateId: "d1",
      startedAt: "2026-09-02T12:00:00+09:00",
    });

  it("starts with no completed stops", () => {
    const s = start();
    expect(s.reproProgress["d1"].completedStops).toEqual([]);
    expect(s.reproProgress["d1"].finished).toBe(false);
  });

  it("completes stops and finishes when all are done", () => {
    let s = start();
    s = reducer(s, { type: "COMPLETE_STOP", dateId: "d1", stopOrder: 1, totalStops: 3 });
    s = reducer(s, { type: "COMPLETE_STOP", dateId: "d1", stopOrder: 2, totalStops: 3 });
    expect(s.reproProgress["d1"].finished).toBe(false);
    s = reducer(s, { type: "COMPLETE_STOP", dateId: "d1", stopOrder: 3, totalStops: 3 });
    expect(s.reproProgress["d1"].completedStops).toEqual([1, 2, 3]);
    expect(s.reproProgress["d1"].finished).toBe(true);
  });

  it("ignores duplicate stop completions", () => {
    let s = start();
    s = reducer(s, { type: "COMPLETE_STOP", dateId: "d1", stopOrder: 1, totalStops: 3 });
    s = reducer(s, { type: "COMPLETE_STOP", dateId: "d1", stopOrder: 1, totalStops: 3 });
    expect(s.reproProgress["d1"].completedStops).toEqual([1]);
  });

  it("links the created reproduction post to the finished run", () => {
    let s = start();
    s = reducer(s, { type: "COMPLETE_STOP", dateId: "d1", stopOrder: 1, totalStops: 1 });
    const reproduction: Reproduction = {
      id: "rX",
      originalDateId: "d1",
      originalPostId: "p1",
      reproductionPostId: "pR",
      reproducerId: "u_me",
      reproducerType: "individual",
      changedStops: [],
      comment: "楽しかった",
      rating: 5,
      createdAt: "2026-09-02T13:00:00+09:00",
    };
    s = reducer(s, { type: "CREATE_POST", post: mkPost("pR"), reproduction });
    expect(s.createdReproductions[0].id).toBe("rX");
    expect(s.reproProgress["d1"].postedReproductionId).toBe("rX");
  });

  it("resets a run", () => {
    let s = start();
    s = reducer(s, { type: "RESET_REPRODUCTION", dateId: "d1" });
    expect(s.reproProgress["d1"]).toBeUndefined();
  });
});

describe("report / block", () => {
  it("records reported posts and blocked actors", () => {
    let s = reducer(initialState, { type: "REPORT_POST", postId: "p1" });
    s = reducer(s, { type: "BLOCK_ACTOR", actorId: "u1" });
    expect(s.reportedPosts["p1"]).toBe(true);
    expect(s.blockedActors["u1"]).toBe(true);
  });
});
