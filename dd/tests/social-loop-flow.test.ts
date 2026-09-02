/**
 * Integration test for the core DD Social Loop (spec §85 / §119 / §133):
 * Home → Post → Follow → Save → Date Detail → Reproduce → Complete
 * → Reproduction Post → Feed → Original attribution → Profile.
 * Exercised at the state/selector level (the same code paths the UI uses).
 */
import { describe, expect, it } from "vitest";
import type { Post, Reproduction } from "@/types";
import { initialState, isFollowing, reducer, type DemoState } from "@/lib/state";
import {
  decoratePost,
  getDate,
  getFeed,
  getPost,
  getReproductionByPost,
  getReproductionsOfDate,
  getPostsByAuthor,
} from "@/lib/selectors";
import { DEMO_USER_ID, HERO_DATE_ID, HERO_POST_ID } from "@/data/mock";

describe("DD Social Loop end-to-end", () => {
  it("completes the full demo scenario without breaking", () => {
    let s: DemoState = reducer(initialState, { type: "MARK_ONBOARDED" });

    // 1. Home feed contains the hero post by Mai × Yui
    const feed = getFeed(s, "recommended");
    const heroInFeed = feed.find((p) => p.id === HERO_POST_ID);
    expect(heroInFeed).toBeDefined();
    expect(heroInFeed?.authorId).toBe("c1");

    // 2. Follow Mai × Yui
    s = reducer(s, { type: "TOGGLE_FOLLOW", actorId: "c1", baseFollowing: false });
    expect(isFollowing(s, "c1")).toBe(true);
    expect(getFeed(s, "following").some((p) => p.authorId === "c1")).toBe(true);

    // 3. Save the post and the structured date
    s = reducer(s, { type: "TOGGLE_SAVE_POST", postId: HERO_POST_ID });
    s = reducer(s, { type: "TOGGLE_SAVE_DATE", dateId: HERO_DATE_ID });
    expect(decoratePost(s, getPost(s, HERO_POST_ID)!).isSaved).toBe(true);

    // 4. Open date detail and start the reproduction
    const date = getDate(s, HERO_DATE_ID)!;
    expect(date.timeline.length).toBe(4);
    s = reducer(s, {
      type: "START_REPRODUCTION",
      dateId: date.id,
      startedAt: new Date().toISOString(),
    });

    // 5. Complete every stop
    for (const stop of date.timeline) {
      s = reducer(s, {
        type: "COMPLETE_STOP",
        dateId: date.id,
        stopOrder: stop.order,
        totalStops: date.timeline.length,
      });
    }
    expect(s.reproProgress[date.id].finished).toBe(true);

    // 6. Create the reproduction post
    const post: Post = {
      id: "pFlow",
      authorId: DEMO_USER_ID,
      authorType: "individual",
      type: "reproduction",
      caption: "Mai × Yuiさんの銀座デートを再現しました",
      media: [{ id: "m1", type: "image", url: "x", alt: "" }],
      dateId: date.id,
      originalDateId: date.id,
      originalPostId: date.postId,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      reproductionsCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    };
    const reproduction: Reproduction = {
      id: "rFlow",
      originalDateId: date.id,
      originalPostId: date.postId,
      reproductionPostId: post.id,
      reproducerId: DEMO_USER_ID,
      reproducerType: "individual",
      changedStops: date.timeline.map((stop, i) => ({
        stopId: stop.id,
        changed: i === date.timeline.length - 1,
        note: i === date.timeline.length - 1 ? "バーを変更" : "Same",
      })),
      comment: "最高の夜でした",
      rating: 5,
      createdAt: new Date().toISOString(),
    };
    s = reducer(s, { type: "CREATE_POST", post, reproduction });

    // 7. New post appears at the top of the feed
    expect(getFeed(s, "recommended")[0].id).toBe("pFlow");

    // 8. Original attribution resolves back to Mai × Yui's date & post
    const record = getReproductionByPost(s, "pFlow");
    expect(record?.originalDateId).toBe(HERO_DATE_ID);
    expect(getPost(s, record!.originalPostId)?.authorId).toBe("c1");

    // 9. The reproduction is counted for the original date
    const reprosOfHero = getReproductionsOfDate(s, HERO_DATE_ID);
    expect(reprosOfHero.some((r) => r.id === "rFlow")).toBe(true);

    // 10. The demo user's profile shows the new reproduction post
    const myPosts = getPostsByAuthor(s, DEMO_USER_ID);
    expect(myPosts[0].id).toBe("pFlow");
    expect(myPosts[0].type).toBe("reproduction");
  });
});
