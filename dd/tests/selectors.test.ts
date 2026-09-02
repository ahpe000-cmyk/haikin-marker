import { describe, expect, it } from "vitest";
import type { Post } from "@/types";
import { initialState, reducer } from "@/lib/state";
import { decoratePost, getFeed, getPost, getSaved } from "@/lib/selectors";
import { DEMO_USER_ID, mockPosts } from "@/data/mock";

const mkPost = (id: string, overrides: Partial<Post> = {}): Post => ({
  id,
  authorId: DEMO_USER_ID,
  authorType: "individual",
  type: "normal",
  caption: "test",
  media: [],
  likesCount: 10,
  commentsCount: 2,
  savesCount: 5,
  reproductionsCount: 0,
  isLiked: false,
  isSaved: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("decoratePost", () => {
  it("applies like and save state with count adjustments", () => {
    const base = mockPosts[0];
    let s = reducer(initialState, {
      type: "TOGGLE_LIKE",
      postId: base.id,
      baseLiked: false,
    });
    s = reducer(s, { type: "TOGGLE_SAVE_POST", postId: base.id });
    const decorated = decoratePost(s, base);
    expect(decorated.isLiked).toBe(true);
    expect(decorated.isSaved).toBe(true);
    expect(decorated.likesCount).toBe(base.likesCount + 1);
    expect(decorated.savesCount).toBe(base.savesCount + 1);
  });

  it("adds user comment count", () => {
    const base = mockPosts[0];
    const s = reducer(initialState, {
      type: "ADD_COMMENT",
      comment: {
        id: "cmX",
        postId: base.id,
        authorId: DEMO_USER_ID,
        text: "test",
        createdAt: new Date().toISOString(),
      },
    });
    expect(decoratePost(s, base).commentsCount).toBe(base.commentsCount + 1);
  });
});

describe("getFeed", () => {
  it("pins demo-created posts to the top of the recommended feed", () => {
    const s = reducer(initialState, { type: "CREATE_POST", post: mkPost("pNew") });
    const feed = getFeed(s, "recommended");
    expect(feed[0].id).toBe("pNew");
    expect(feed.length).toBe(mockPosts.length + 1);
  });

  it("following feed only shows followed actors and the demo user", () => {
    const feed = getFeed(initialState, "following");
    expect(feed.length).toBeGreaterThan(0);
    for (const p of feed) {
      expect(["u2", "u10", "c5", "c6", DEMO_USER_ID]).toContain(p.authorId);
    }
  });

  it("excludes posts from blocked actors", () => {
    const s = reducer(initialState, { type: "BLOCK_ACTOR", actorId: "c1" });
    const feed = getFeed(s, "recommended");
    expect(feed.some((p) => p.authorId === "c1")).toBe(false);
  });

  it("excludes reported posts", () => {
    const target = mockPosts[0].id;
    const s = reducer(initialState, { type: "REPORT_POST", postId: target });
    expect(getFeed(s, "recommended").some((p) => p.id === target)).toBe(false);
  });
});

describe("getPost / getSaved", () => {
  it("resolves created posts before mock posts", () => {
    const s = reducer(initialState, { type: "CREATE_POST", post: mkPost("pNew") });
    expect(getPost(s, "pNew")?.caption).toBe("test");
    expect(getPost(s, mockPosts[0].id)).toBeDefined();
    expect(getPost(s, "nope")).toBeUndefined();
  });

  it("collects saved posts and dates", () => {
    let s = reducer(initialState, {
      type: "TOGGLE_SAVE_POST",
      postId: mockPosts[0].id,
    });
    s = reducer(s, { type: "TOGGLE_SAVE_DATE", dateId: "d01" });
    const saved = getSaved(s);
    expect(saved.posts.map((p) => p.id)).toContain(mockPosts[0].id);
    expect(saved.dates.map((d) => d.id)).toContain("d01");
  });
});
