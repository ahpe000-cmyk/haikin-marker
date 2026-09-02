/**
 * Mock repository for posts. See repositories/actors.ts for the swap note.
 */
import type { Post } from "@/types";
import { mockPosts } from "@/data/mock";

export function getMockPost(id: string): Post | undefined {
  return mockPosts.find((p) => p.id === id);
}

export function listMockPosts(): Post[] {
  return [...mockPosts].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export function listMockPostsByAuthor(authorId: string): Post[] {
  return listMockPosts().filter((p) => p.authorId === authorId);
}

export function listMockReproductionPostsOfDate(dateId: string): Post[] {
  return listMockPosts().filter(
    (p) => p.type === "reproduction" && p.originalDateId === dateId
  );
}
