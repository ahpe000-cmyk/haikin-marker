/**
 * Mock repository for comments & reviews. See repositories/actors.ts for the swap note.
 */
import type { Comment, Review } from "@/types";
import { mockComments, mockReviews } from "@/data/mock";

export function listMockComments(postId: string): Comment[] {
  return mockComments
    .filter((c) => c.postId === postId)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

export function listMockReviews(dateId: string): Review[] {
  return mockReviews
    .filter((r) => r.dateId === dateId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
