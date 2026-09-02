"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-20 w-20 text-xl",
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src: string;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink/10 font-semibold text-ink/60",
        sizeClasses[size],
        className
      )}
    >
      {failed ? (
        <span aria-hidden>{name.slice(0, 1)}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- demo uses external placeholder images with custom fallback handling
        <img
          src={src}
          alt={`${name}のアイコン`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  );
}
