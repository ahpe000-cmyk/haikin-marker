"use client";

import type { Choice, ChoiceId } from "@/lib/domain/types";

export function PollResults({
  choices,
  counts,
  total,
  myChoiceId,
}: {
  choices: Choice[];
  counts: Record<ChoiceId, number>;
  total: number;
  myChoiceId: ChoiceId | null;
}) {
  return (
    <div aria-live="polite">
      <ul className="space-y-3">
        {choices.map((choice) => {
          const count = counts[choice.id] ?? 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const mine = choice.id === myChoiceId;
          return (
            <li key={choice.id}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className={mine ? "font-bold" : ""}>
                  {choice.text}
                  {mine ? (
                    <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent-strong">
                      あなたの選択
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {percent}%
                  <span className="ml-1 text-xs font-normal text-muted">
                    ({count}票)
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full transition-[width] duration-200 ${
                    mine ? "bg-accent" : "bg-line"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">
        回答者{total}人の実際の集計です。
      </p>
    </div>
  );
}
