"use client";

import type { Choice, ChoiceId } from "@/lib/domain/types";

export function PollQuestion({
  choices,
  disabled,
  onVote,
}: {
  choices: Choice[];
  disabled: boolean;
  onVote: (choiceId: ChoiceId) => void;
}) {
  return (
    <div className="space-y-3" role="group" aria-label="回答の選択肢">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          disabled={disabled}
          onClick={() => onVote(choice.id)}
          className="flex w-full min-h-[52px] items-center gap-3 rounded-xl border-2 border-line bg-background p-3 text-left transition-colors duration-150 hover:border-accent hover:bg-accent-soft disabled:pointer-events-none disabled:opacity-60"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-muted"
          >
            {choice.id.toUpperCase()}
          </span>
          <span className="flex-1 text-[15px] leading-relaxed">
            {choice.text}
          </span>
        </button>
      ))}
    </div>
  );
}
