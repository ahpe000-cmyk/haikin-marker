"use client";

import { Star } from "lucide-react";

export function Rating({
  value,
  showValue = true,
  className = "",
}: {
  value: number;
  showValue?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm ${className}`}
      aria-label={`評価 ${value.toFixed(1)} / 5`}
    >
      <Star
        className="h-4 w-4 fill-amber-400 text-amber-400"
        aria-hidden
      />
      {showValue && (
        <span className="font-semibold text-[var(--dd-ink)]">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

export function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--dd-charcoal)]">{label}</span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}点`}
            onClick={() => onChange(n)}
            className="rounded p-0.5 transition-transform active:scale-90"
          >
            <Star
              className={`h-6 w-6 ${
                n <= value
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-neutral-300"
              }`}
              aria-hidden
            />
          </button>
        ))}
      </div>
    </div>
  );
}
