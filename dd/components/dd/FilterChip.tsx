"use client";

export function FilterChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        selected
          ? "border-[var(--dd-ink)] bg-[var(--dd-ink)] text-white"
          : "border-[var(--dd-line)] bg-white text-[var(--dd-charcoal)] hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}
