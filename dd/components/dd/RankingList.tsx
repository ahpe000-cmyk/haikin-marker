"use client";

import Link from "next/link";
import { Bookmark, RotateCw } from "lucide-react";
import { AREA_LABELS } from "@/data/meta";
import { formatCount } from "@/lib/format";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { RankingEntry } from "@/types";
import { CoverImage } from "@/components/dd/CoverImage";
import { Rating } from "@/components/dd/Rating";

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-[var(--dd-accent)] text-white";
  if (rank <= 3) return "bg-[var(--dd-ink)] text-white";
  return "bg-neutral-100 text-[var(--dd-charcoal)]";
}

export function RankingList({
  entries,
  showScore = false,
}: {
  entries: RankingEntry[];
  showScore?: boolean;
}) {
  const { statsOf } = useDemoStore();

  return (
    <ol className="space-y-3">
      {entries.map(({ plan, rank, score }) => {
        const stats = statsOf(plan);
        return (
          <li key={plan.id}>
            <Link
              href={`/date/${plan.id}`}
              className="flex items-center gap-3 rounded-2xl border border-[var(--dd-line)] bg-white p-3 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankBadgeClass(rank)}`}
                aria-label={`${rank}位`}
              >
                {rank}
              </span>
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <CoverImage
                  seed={plan.coverImageSeed}
                  alt={plan.title}
                  width={320}
                  height={240}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold leading-snug">
                  {plan.title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--dd-gray)]">
                  {AREA_LABELS[plan.area]}
                  {showScore && ` ・ Score ${score.toFixed(1)}`}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-[var(--dd-gray)]">
                  <Rating value={stats.rating} />
                  <span className="inline-flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5" aria-hidden />
                    {formatCount(stats.saveCount)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <RotateCw className="h-3.5 w-3.5" aria-hidden />
                    {formatCount(stats.reproduceCount)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
