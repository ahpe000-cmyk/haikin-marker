import { describe, expect, it } from "vitest";
import {
  mockComments,
  mockCouples,
  mockDates,
  mockPosts,
  mockReproductions,
  mockReviews,
  mockUsers,
} from "@/data/mock";

const actorIds = new Set([...mockUsers, ...mockCouples].map((a) => a.id));
const postIds = new Set(mockPosts.map((p) => p.id));
const dateIds = new Set(mockDates.map((d) => d.id));

describe("mock data volume (spec §81)", () => {
  it("has at least 12 individual users", () => {
    expect(mockUsers.length).toBeGreaterThanOrEqual(12);
  });
  it("has at least 8 couples", () => {
    expect(mockCouples.length).toBeGreaterThanOrEqual(8);
  });
  it("has at least 40 posts", () => {
    expect(mockPosts.length).toBeGreaterThanOrEqual(40);
  });
  it("has at least 25 structured dates", () => {
    expect(mockDates.length).toBeGreaterThanOrEqual(25);
  });
  it("has at least 15 reproduction posts", () => {
    expect(mockPosts.filter((p) => p.type === "reproduction").length).toBeGreaterThanOrEqual(15);
  });
  it("has at least 80 comments", () => {
    expect(mockComments.length).toBeGreaterThanOrEqual(80);
  });
  it("has at least 30 reviews", () => {
    expect(mockReviews.length).toBeGreaterThanOrEqual(30);
  });
});

describe("mock data relations", () => {
  it("every post author exists", () => {
    for (const p of mockPosts) expect(actorIds.has(p.authorId)).toBe(true);
  });

  it("every post's dateId / originalDateId / originalPostId resolve", () => {
    for (const p of mockPosts) {
      if (p.dateId) expect(dateIds.has(p.dateId)).toBe(true);
      if (p.originalDateId) expect(dateIds.has(p.originalDateId)).toBe(true);
      if (p.originalPostId) expect(postIds.has(p.originalPostId)).toBe(true);
    }
  });

  it("every date links back to an existing post that links to it", () => {
    for (const d of mockDates) {
      const post = mockPosts.find((p) => p.id === d.postId);
      expect(post).toBeDefined();
      expect(post?.dateId).toBe(d.id);
      expect(post?.type).toBe("date");
    }
  });

  it("every reproduction record's references resolve", () => {
    for (const r of mockReproductions) {
      expect(dateIds.has(r.originalDateId)).toBe(true);
      expect(postIds.has(r.originalPostId)).toBe(true);
      expect(postIds.has(r.reproductionPostId)).toBe(true);
      expect(actorIds.has(r.reproducerId)).toBe(true);
      const reproPost = mockPosts.find((p) => p.id === r.reproductionPostId);
      expect(reproPost?.type).toBe("reproduction");
      expect(reproPost?.originalDateId).toBe(r.originalDateId);
    }
  });

  it("changed-stop references point to real timeline stops", () => {
    for (const r of mockReproductions) {
      const original = mockDates.find((d) => d.id === r.originalDateId);
      expect(original).toBeDefined();
      const stopIds = new Set(original?.timeline.map((s) => s.id));
      for (const cs of r.changedStops) expect(stopIds.has(cs.stopId)).toBe(true);
    }
  });

  it("comments and reviews reference existing content and authors", () => {
    for (const c of mockComments) {
      expect(postIds.has(c.postId)).toBe(true);
      expect(actorIds.has(c.authorId)).toBe(true);
    }
    for (const rv of mockReviews) {
      expect(dateIds.has(rv.dateId)).toBe(true);
      expect(actorIds.has(rv.authorId)).toBe(true);
    }
  });

  it("no comment is authored by its own post's author", () => {
    for (const c of mockComments) {
      const post = mockPosts.find((p) => p.id === c.postId);
      expect(c.authorId).not.toBe(post?.authorId);
    }
  });

  it("timeline stops are ordered 1..n", () => {
    for (const d of mockDates) {
      d.timeline.forEach((s, i) => expect(s.order).toBe(i + 1));
      expect(d.timeline.length).toBeGreaterThan(0);
    }
  });
});
