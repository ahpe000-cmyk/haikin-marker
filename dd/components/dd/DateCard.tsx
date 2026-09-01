"use client";

import Link from "next/link";
import { Bookmark, Clock, MapPin, RotateCw } from "lucide-react";
import { AREA_LABELS } from "@/data/meta";
import { CREATOR_MAP, DEMO_USER } from "@/data/creators";
import { formatBudgetRange, formatCount, formatDuration } from "@/lib/format";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { DatePlan } from "@/types";
import { CoverImage } from "@/components/dd/CoverImage";
import { Rating } from "@/components/dd/Rating";
import { SaveButton } from "@/components/dd/SaveButton";
import { Tag } from "@/components/dd/Tag";

export function DateCard({
  plan,
  layout = "vertical",
}: {
  plan: DatePlan;
  layout?: "vertical" | "horizontal-scroll";
}) {
  const { statsOf } = useDemoStore();
  const stats = statsOf(plan);
  const creatorName = plan.isUserPost
    ? DEMO_USER.name
    : (CREATOR_MAP[plan.creatorId]?.name ?? "unknown");

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-[var(--dd-line)] bg-white shadow-sm ${
        layout === "horizontal-scroll" ? "w-64 shrink-0" : "w-full"
      }`}
    >
      {/* カード全体タップで詳細へ（stretched link） */}
      <Link
        href={`/date/${plan.id}`}
        aria-label={`${plan.title} の詳細を見る`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dd-accent)]"
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <CoverImage seed={plan.coverImageSeed} alt={plan.title} />
        <div className="absolute right-2 top-2 z-[2]">
          <SaveButton planId={plan.id} />
        </div>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug">
          {plan.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--dd-gray)]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {AREA_LABELS[plan.area]}
          </span>
          <span>{formatBudgetRange(plan.budgetMin, plan.budgetMax)} / 1人</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatDuration(plan.durationMinutes)}
          </span>
        </div>
        <p className="truncate text-xs text-[var(--dd-gray)]">
          by {creatorName}
        </p>
        <div className="flex flex-wrap gap-1">
          {plan.tags.slice(0, 3).map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--dd-gray)]">
          <Rating value={stats.rating} />
          <span className="inline-flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5" aria-hidden />
            {formatCount(stats.saveCount)}
          </span>
          <span
            className="inline-flex items-center gap-1"
            title="再現された回数"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
            {formatCount(stats.reproduceCount)}回再現
          </span>
        </div>
      </div>
    </article>
  );
}
