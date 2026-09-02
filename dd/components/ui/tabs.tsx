"use client";

import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "underline",
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "underline" | "pill";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex",
        variant === "underline" && "border-b border-line",
        variant === "pill" && "gap-2 overflow-x-auto no-scrollbar",
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "min-h-11 whitespace-nowrap text-sm font-medium transition-colors",
              variant === "underline" &&
                cn(
                  "flex-1 border-b-2 px-2 pb-2.5 pt-2",
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                ),
              variant === "pill" &&
                cn(
                  "rounded-full border px-4",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-muted hover:text-ink"
                )
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
