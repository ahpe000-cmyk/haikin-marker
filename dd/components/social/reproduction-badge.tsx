"use client";

import Link from "next/link";
import { Repeat2 } from "lucide-react";
import type { Post } from "@/types";
import { getActor } from "@/repositories/actors";
import { useAppState } from "@/lib/store";
import { getDate, getPost } from "@/lib/selectors";

/**
 * Original attribution shown on reproduction posts:
 * 「◯◯のデートを再現しました」+ link back to the original post.
 */
export function ReproductionBadge({ post }: { post: Post }) {
  const { state } = useAppState();
  if (post.type !== "reproduction" || !post.originalDateId) return null;

  const originalDate = getDate(state, post.originalDateId);
  const originalPost = post.originalPostId
    ? getPost(state, post.originalPostId)
    : undefined;
  const originalAuthor = originalPost ? getActor(originalPost.authorId) : undefined;

  if (!originalDate) return null;

  return (
    <Link
      href={originalPost ? `/post/${originalPost.id}` : `/date/${originalDate.id}`}
      className="mx-4 mt-2 flex items-center gap-2.5 rounded-xl bg-accent-soft px-3 py-2.5 transition-colors hover:bg-accent-soft/70"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <Repeat2 className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-accent-dark">
          Original
        </span>
        <span className="block truncate text-[13px] font-medium text-ink">
          {originalAuthor ? `${originalAuthor.displayName}「${originalDate.title}」` : originalDate.title}
        </span>
      </span>
      <span className="shrink-0 text-xs font-medium text-accent-dark">見る</span>
    </Link>
  );
}
