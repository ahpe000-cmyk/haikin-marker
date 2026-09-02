"use client";

import Link from "next/link";
import { Star, Bookmark, Repeat2 } from "lucide-react";
import type { DateExperience } from "@/types";
import { useAppState } from "@/lib/store";
import { getPost } from "@/lib/selectors";
import { getActor } from "@/repositories/actors";
import { SmartImage } from "@/components/shared/smart-image";
import { formatBudget, formatCount, formatDuration } from "@/lib/utils";

/** Structured date card used in Discover / Search / Profile / Saved. */
export function DateCard({ date }: { date: DateExperience }) {
  const { state } = useAppState();
  const post = getPost(state, date.postId);
  const author = post ? getActor(post.authorId) : undefined;
  const cover = post?.media[0]?.url ?? date.timeline[0]?.image ?? "";

  return (
    <Link
      href={`/date/${date.id}`}
      className="flex gap-3 rounded-2xl border border-line bg-white p-3 transition-colors hover:bg-ink/[0.02]"
    >
      <SmartImage
        src={cover}
        alt={date.title}
        aspect="1/1"
        className="w-24 shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{date.title}</h3>
        {author && (
          <p className="mt-0.5 truncate text-xs text-muted">{author.displayName}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          {date.area} ・ {formatBudget(date.budgetMin, date.budgetMax)} ・{" "}
          {formatDuration(date.durationMinutes)}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-0.5 font-medium text-ink">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {date.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5">
            <Bookmark className="h-3.5 w-3.5" aria-hidden />
            {formatCount(date.saveCount)}
          </span>
          <span className="flex items-center gap-0.5 font-medium text-accent-dark">
            <Repeat2 className="h-3.5 w-3.5" aria-hidden />
            {formatCount(date.reproductionCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
