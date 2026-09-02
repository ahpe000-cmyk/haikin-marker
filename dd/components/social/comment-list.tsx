"use client";

import Link from "next/link";
import type { Comment } from "@/types";
import { getActor } from "@/repositories/actors";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { actorProfileHref } from "./post-header";
import { EmptyState } from "@/components/shared/states";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="まだコメントがありません"
        description="最初のコメントを書いてみましょう"
      />
    );
  }

  return (
    <ul className="space-y-4 px-4 py-4">
      {comments.map((comment) => {
        const author = getActor(comment.authorId);
        return (
          <li key={comment.id} className="flex gap-3">
            {author ? (
              <Link href={actorProfileHref(author.id)} className="shrink-0">
                <Avatar src={author.avatar} name={author.displayName} size="sm" />
              </Link>
            ) : (
              <span className="h-8 w-8 shrink-0 rounded-full bg-ink/10" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <Link
                  href={author ? actorProfileHref(author.id) : "#"}
                  className="mr-2 font-semibold"
                >
                  {author?.displayName ?? "不明なユーザー"}
                </Link>
                {comment.text}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                <time dateTime={comment.createdAt}>
                  {formatRelativeTime(comment.createdAt)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
