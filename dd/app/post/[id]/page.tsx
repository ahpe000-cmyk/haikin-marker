"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Repeat2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import {
  decoratePost,
  getComments,
  getDate,
  getPost,
  getAllPosts,
} from "@/lib/selectors";
import { PageHeader } from "@/components/shared/page-header";
import { PostHeader } from "@/components/social/post-header";
import { PostMediaCarousel } from "@/components/social/post-media-carousel";
import { PostActions } from "@/components/social/post-actions";
import { ReproductionBadge } from "@/components/social/reproduction-badge";
import { CommentList } from "@/components/social/comment-list";
import { CommentForm } from "@/components/social/comment-form";
import { DateSummary } from "@/components/date/date-summary";
import { DateCard } from "@/components/date/date-card";
import { ErrorState, LoadingState } from "@/components/shared/states";
import { formatRelativeTime } from "@/lib/utils";

/** SCREEN 03: Post Detail. */
export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, ready } = useAppState();

  if (!ready) {
    return (
      <>
        <PageHeader title="投稿" />
        <LoadingState variant="feed" />
      </>
    );
  }

  const post = getPost(state, params.id);
  if (!post) {
    return (
      <>
        <PageHeader title="投稿" />
        <ErrorState title="投稿が見つかりません" />
      </>
    );
  }

  const decorated = decoratePost(state, post);
  const linkedDate = post.dateId ? getDate(state, post.dateId) : undefined;
  const ctaDateId =
    post.type === "reproduction" ? post.originalDateId ?? post.dateId : post.dateId;
  const comments = getComments(state, post.id);

  // Related: other date posts in the same area (or by the same author)
  const related = getAllPosts(state)
    .filter(
      (p) =>
        p.id !== post.id &&
        p.type === "date" &&
        p.dateId &&
        (p.location === post.location || p.authorId === post.authorId)
    )
    .slice(0, 3)
    .map((p) => getDate(state, p.dateId as string))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);

  return (
    <>
      <PageHeader title="投稿" />
      <article className="pb-2">
        <PostHeader post={post} />
        <PostMediaCarousel media={post.media} priority />
        <div className="pt-2">
          <PostActions post={decorated} />
        </div>
        <p className="whitespace-pre-line px-4 pt-1 text-sm leading-relaxed">
          {post.caption}
        </p>
        <p className="px-4 pt-2 text-xs text-muted">
          <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
        </p>

        <ReproductionBadge post={post} />
        {linkedDate && post.type === "date" && <DateSummary date={linkedDate} />}

        {ctaDateId && (
          <div className="flex gap-2 px-4 pt-3">
            <Link
              href={`/date/${ctaDateId}`}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-white text-sm font-medium hover:bg-ink/5"
            >
              デート詳細を見る
            </Link>
            <Link
              href={`/date/${ctaDateId}/reproduce`}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent text-sm font-medium text-white hover:bg-accent-dark"
            >
              <Repeat2 className="h-4 w-4" aria-hidden />
              このデートを再現
            </Link>
          </div>
        )}
      </article>

      <section id="comments" className="border-t border-line">
        <h2 className="px-4 pt-4 text-sm font-semibold text-muted">
          コメント {decorated.commentsCount > 0 && `(${comments.length})`}
        </h2>
        <CommentList comments={comments} />
        <CommentForm postId={post.id} />
      </section>

      {related.length > 0 && (
        <section className="border-t border-line px-4 py-5">
          <h2 className="mb-3 text-sm font-semibold text-muted">関連するデート</h2>
          <div className="space-y-3">
            {related.map((d) => (
              <DateCard key={d.id} date={d} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
