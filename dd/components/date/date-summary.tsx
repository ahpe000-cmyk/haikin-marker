"use client";

import { ChevronRight } from "lucide-react";
import type { DateExperience } from "@/types";
import { formatDuration, formatYen } from "@/lib/utils";

/** Compact date summary strip shown under a date post in the feed. */
export function DateSummary({ date }: { date: DateExperience }) {
  return (
    <div className="mx-4 mb-1 mt-2 rounded-xl border border-line bg-white p-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-ink">
          {date.area}
        </span>
        <span className="text-xs text-muted">
          {formatYen(Math.round((date.budgetMin + date.budgetMax) / 2))} / person
        </span>
        <span className="text-xs text-muted">{formatDuration(date.durationMinutes)}</span>
      </div>
      <div className="no-scrollbar mt-1.5 flex items-center gap-1 overflow-x-auto text-[13px] font-medium text-ink/80">
        {date.timeline.map((stop, i) => (
          <span key={stop.id} className="flex shrink-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted" aria-hidden />}
            {stop.category}
          </span>
        ))}
      </div>
    </div>
  );
}
