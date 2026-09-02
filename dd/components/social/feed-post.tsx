"use client";

import Link from "next/link";
import { Repeat2 } from "lucide-react";
import type { Post } from "@/types";
import { useAppState } from "@/lib/store";
import { decoratePost, getDate } from "@/lib/selectors";
import { formatRelativeTime } from "@/lib/utils";
import { PostHeader } from "./post-header";
import { PostMediaCarousel } from "./post-media-carousel";
import { PostActions } from "./post-actions";
import { ReproductionBadge } from "./reproduction-badge";
import { DateSummary } from "@/components/date/date-summary";

/** One post in the vertical home feed. */
export function FeedPost({ post, priority = false }: { post: Post; priority?: boolean }) {
  const { state } = useAppState();
  const decorated = decoratePost(state, post);
  const linkedDate = post.dateId ? getDate(state, post.dateId) : undefined;
  // For reproduction posts the CTA targets the ORIGINAL date (attribution goes home)
  const ctaDateId =
    post.type === "reproduction" ? post.originalDateId ?? post.dateId : post.dateId;

  return (
    <article className="border-b border-line pb-4 pt-1">
      <PostHeader post={post} />
      <PostMediaCarousel media={post.media} priority={priority} />
      <div className="pt-2">
        <PostActions post={decorated} commentHref={`/post/${post.id}#comments`} />
      </div>

      <p className="whitespace-pre-line px-4 pt-1 text-sm leading-relaxed">
        {post.caption.length > 90 ? (
          <>
            {post.caption.slice(0, 90)}…{" "}
            <Link href={`/post/${post.id}`} className="text-muted hover:text-ink">
              続きを読む
            </Link>
          </>
        ) : (
          post.caption
        )}
      </p>

      <ReproductionBadge post={post} />
      {linkedDate && post.type === "date" && <DateSummary date={linkedDate} />}

      {ctaDateId && (
        <div className="flex gap-2 px-4 pt-3">
          <Link
            href={`/date/${ctaDateId}`}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-white text-sm font-medium hover:bg-ink/5"
          >
            このデートを見る
          </Link>
          <Link
            href={`/date/${ctaDateId}/reproduce`}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent text-sm font-medium text-white hover:bg-accent-dark"
          >
            <Repeat2 className="h-4 w-4" aria-hidden />
            再現する
          </Link>
        </div>
      )}

      <p className="px-4 pt-2.5 text-xs text-muted">
        <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
      </p>
    </article>
  );
}
