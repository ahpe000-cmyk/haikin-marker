"use client";

import type { DateStop } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";
import { formatDuration, formatYen, cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function TimelineStopItem({
  stop,
  isLast,
  completed,
  onComplete,
}: {
  stop: DateStop;
  isLast: boolean;
  /** undefined = viewing mode; boolean = reproduction mode. */
  completed?: boolean;
  onComplete?: () => void;
}) {
  const reproduceMode = completed !== undefined;

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {/* rail */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
            completed
              ? "border-accent bg-accent text-white"
              : "border-ink bg-white text-ink"
          )}
        >
          {completed ? <Check className="h-4 w-4" aria-hidden /> : stop.order}
        </span>
        {!isLast && <span className="w-0.5 flex-1 bg-line" aria-hidden />}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <p className="text-xs font-bold tabular-nums text-muted">{stop.time}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-snug">{stop.placeName}</h3>
        <p className="mt-0.5 text-xs text-muted">
          {stop.category} ・ {formatDuration(stop.durationMinutes)} ・{" "}
          {stop.estimatedCost === 0 ? "無料" : formatYen(stop.estimatedCost)}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{stop.description}</p>
        <SmartImage
          src={stop.image}
          alt={`${stop.placeName}の写真`}
          aspect="16/9"
          className="mt-2 rounded-xl"
        />
        {reproduceMode && (
          <button
            type="button"
            onClick={onComplete}
            disabled={completed}
            className={cn(
              "mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors",
              completed
                ? "bg-accent-soft text-accent-dark"
                : "bg-ink text-white hover:bg-ink/90"
            )}
          >
            {completed ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                完了
              </>
            ) : (
              "このStopを完了"
            )}
          </button>
        )}
      </div>
    </li>
  );
}

export function Timeline({
  stops,
  completedOrders,
  onCompleteStop,
}: {
  stops: DateStop[];
  completedOrders?: number[];
  onCompleteStop?: (order: number) => void;
}) {
  return (
    <ol className="mt-2">
      {stops.map((stop, i) => (
        <TimelineStopItem
          key={stop.id}
          stop={stop}
          isLast={i === stops.length - 1}
          completed={
            completedOrders !== undefined
              ? completedOrders.includes(stop.order)
              : undefined
          }
          onComplete={onCompleteStop ? () => onCompleteStop(stop.order) : undefined}
        />
      ))}
    </ol>
  );
}
