"use client";

import type { Choice } from "@/lib/domain/types";

export type ChoiceVisualState =
  | "default"
  | "selected-correct"
  | "selected-wrong"
  | "revealed-answer"
  | "dimmed";

const STATE_CLASSES: Record<ChoiceVisualState, string> = {
  default:
    "border-line bg-background hover:border-accent hover:bg-accent-soft",
  "selected-correct": "border-success bg-success-soft",
  "selected-wrong": "border-danger bg-danger-soft",
  "revealed-answer": "border-success border-dashed bg-background",
  dimmed: "border-line bg-background opacity-60",
};

export function ChoiceButton({
  choice,
  state,
  locked,
  statusLabel,
  onSelect,
}: {
  choice: Choice;
  state: ChoiceVisualState;
  locked: boolean;
  /** Text label so correctness is never conveyed by color alone. */
  statusLabel?: string;
  onSelect: (choiceId: Choice["id"]) => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onSelect(choice.id)}
      className={`flex w-full min-h-[52px] items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors duration-150 disabled:pointer-events-none ${STATE_CLASSES[state]}`}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-muted"
      >
        {choice.id.toUpperCase()}
      </span>
      <span className="flex-1 text-[15px] leading-relaxed">{choice.text}</span>
      {statusLabel ? (
        <span
          className={`shrink-0 text-sm font-bold ${
            state === "selected-wrong" ? "text-danger" : "text-success"
          }`}
        >
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
}
