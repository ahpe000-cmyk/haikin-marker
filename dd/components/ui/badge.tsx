import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "accent" | "outline" | "couple";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4",
        variant === "default" && "bg-ink/5 text-ink/70",
        variant === "accent" && "bg-accent-soft text-accent-dark",
        variant === "outline" && "border border-line text-muted",
        variant === "couple" && "bg-ink text-white",
        className
      )}
    >
      {children}
    </span>
  );
}
