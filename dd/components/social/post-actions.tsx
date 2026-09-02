"use client";

import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Share2, Repeat2 } from "lucide-react";
import type { Post } from "@/types";
import { useAppState } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatCount, cn } from "@/lib/utils";

/**
 * Like / Comment / Save / Share row + DD's own reproduction social proof.
 * `post` must already be decorated via lib/selectors.decoratePost.
 */
export function PostActions({
  post,
  commentHref,
}: {
  post: Post;
  commentHref?: string;
}) {
  const { dispatch } = useAppState();
  const toast = useToast();

  return (
    <div className="px-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-pressed={post.isLiked}
          aria-label={post.isLiked ? "いいねを取り消す" : "いいね"}
          onClick={() =>
            dispatch({ type: "TOGGLE_LIKE", postId: post.id, baseLiked: false })
          }
          className="group flex h-11 min-w-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium"
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-colors",
              post.isLiked
                ? "animate-pop-like fill-accent text-accent"
                : "text-ink group-hover:text-accent"
            )}
            strokeWidth={1.8}
            aria-hidden
          />
          <span className="tabular-nums">{formatCount(post.likesCount)}</span>
        </button>

        {commentHref ? (
          <Link
            href={commentHref}
            aria-label="コメントを見る"
            className="flex h-11 min-w-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium hover:text-accent"
          >
            <MessageCircle className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            <span className="tabular-nums">{formatCount(post.commentsCount)}</span>
          </Link>
        ) : (
          <span className="flex h-11 min-w-11 items-center gap-1.5 px-2 text-sm font-medium">
            <MessageCircle className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            <span className="tabular-nums">{formatCount(post.commentsCount)}</span>
          </span>
        )}

        <button
          type="button"
          aria-pressed={post.isSaved}
          aria-label={post.isSaved ? "保存を解除" : "保存"}
          onClick={() => {
            dispatch({ type: "TOGGLE_SAVE_POST", postId: post.id });
            toast(post.isSaved ? "保存を解除しました" : "投稿を保存しました");
          }}
          className="group flex h-11 min-w-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium"
        >
          <Bookmark
            className={cn(
              "h-6 w-6 transition-colors",
              post.isSaved
                ? "animate-pop-like fill-ink text-ink"
                : "text-ink group-hover:text-ink/60"
            )}
            strokeWidth={1.8}
            aria-hidden
          />
          <span className="tabular-nums">{formatCount(post.savesCount)}</span>
        </button>

        <button
          type="button"
          aria-label="共有"
          onClick={() => toast("共有リンクをコピーしました（デモ）")}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
        >
          <Share2 className="h-6 w-6" strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {post.reproductionsCount > 0 && (
        <p className="flex items-center gap-1.5 pb-1 text-sm font-semibold text-accent-dark">
          <Repeat2 className="h-4 w-4" aria-hidden />
          {formatCount(post.reproductionsCount)}人がこのデートを再現
        </p>
      )}
    </div>
  );
}
