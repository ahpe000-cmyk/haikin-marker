/**
 * Derived data helpers combining mock repositories with demo state.
 * Pure functions — unit-testable without React.
 */
import type { Comment, DateExperience, Post, Reproduction } from "@/types";
import { DEMO_USER_ID } from "@/data/mock";
import { listMockPosts, getMockPost } from "@/repositories/posts";
import { getMockDate, listMockDates } from "@/repositories/dates";
import { listMockComments } from "@/repositories/comments";
import { mockReproductions } from "@/data/mock";
import { calcFeedScore } from "./score";
import {
  isDateSaved,
  isFollowing,
  isLiked,
  isPostSaved,
  type DemoState,
} from "./state";

/** All posts (demo-created first), excluding blocked authors & reported posts. */
export function getAllPosts(state: DemoState): Post[] {
  return [...state.createdPosts, ...listMockPosts()].filter(
    (p) => !state.blockedActors[p.authorId] && !state.reportedPosts[p.id]
  );
}

export function getPost(state: DemoState, id: string): Post | undefined {
  return state.createdPosts.find((p) => p.id === id) ?? getMockPost(id);
}

export function getDate(state: DemoState, id: string): DateExperience | undefined {
  return state.createdDates.find((d) => d.id === id) ?? getMockDate(id);
}

export function getAllDates(state: DemoState): DateExperience[] {
  return [...state.createdDates, ...listMockDates()];
}

export function getAllReproductions(state: DemoState): Reproduction[] {
  return [...state.createdReproductions, ...mockReproductions];
}

export function getReproductionsOfDate(state: DemoState, dateId: string): Reproduction[] {
  return getAllReproductions(state).filter((r) => r.originalDateId === dateId);
}

export function getReproductionByPost(state: DemoState, postId: string): Reproduction | undefined {
  return getAllReproductions(state).find((r) => r.reproductionPostId === postId);
}

/** Post decorated with the demo user's interaction state and adjusted counts. */
export function decoratePost(state: DemoState, post: Post): Post {
  const liked = isLiked(state, post.id, post.isLiked);
  const saved = isPostSaved(state, post.id);
  const addedComments = state.userComments[post.id]?.length ?? 0;
  return {
    ...post,
    isLiked: liked,
    isSaved: saved,
    likesCount: post.likesCount + (liked && !post.isLiked ? 1 : 0) - (!liked && post.isLiked ? 1 : 0),
    savesCount: post.savesCount + (saved ? 1 : 0),
    commentsCount: post.commentsCount + addedComments,
  };
}

/** All comments for a post: mock + demo-user-added, oldest first. */
export function getComments(state: DemoState, postId: string): Comment[] {
  const added = state.userComments[postId] ?? [];
  return [...listMockComments(postId), ...added];
}

export type FeedTab = "recommended" | "following";

/**
 * Home feed. Demo algorithm (see lib/score.ts / README):
 * - recommended: demo-created posts pinned first, then mock posts by feed score
 * - following:   posts by followed actors (and the demo user), newest first
 */
export function getFeed(state: DemoState, tab: FeedTab): Post[] {
  const posts = getAllPosts(state);
  if (tab === "following") {
    return posts
      .filter(
        (p) => p.authorId === DEMO_USER_ID || isFollowing(state, p.authorId)
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const created = posts.filter((p) => state.createdPosts.some((c) => c.id === p.id));
  const rest = posts.filter((p) => !created.includes(p));
  rest.sort((a, b) => calcFeedScore(b) - calcFeedScore(a));
  return [...created, ...rest];
}

export interface SavedContent {
  posts: Post[];
  dates: DateExperience[];
}

export function getSaved(state: DemoState): SavedContent {
  const posts = getAllPosts(state).filter((p) => isPostSaved(state, p.id));
  const dates = getAllDates(state).filter((d) => isDateSaved(state, d.id));
  return { posts, dates };
}

export function getPostsByAuthor(state: DemoState, authorId: string): Post[] {
  return getAllPosts(state)
    .filter((p) => p.authorId === authorId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** Structured dates created by an author (via their date posts). */
export function getDatesByAuthor(state: DemoState, authorId: string): DateExperience[] {
  return getPostsByAuthor(state, authorId)
    .filter((p) => p.type === "date" && p.dateId)
    .map((p) => getDate(state, p.dateId as string))
    .filter((d): d is DateExperience => d !== undefined);
}

/** Reproduction posts created by an author. */
export function getReproductionPostsByAuthor(state: DemoState, authorId: string): Post[] {
  return getPostsByAuthor(state, authorId).filter((p) => p.type === "reproduction");
}
