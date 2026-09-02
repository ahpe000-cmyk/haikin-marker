"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Image with fixed aspect ratio, skeleton while loading, lazy loading,
 * and a graceful fallback when the source fails.
 */
export function SmartImage({
  src,
  alt,
  aspect = "4/5",
  className,
  imgClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  /** CSS aspect-ratio value, e.g. "4/5", "1/1", "16/9". */
  aspect?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-ink/5", className)}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-ink/10" aria-hidden />
      )}
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
          <ImageOff className="h-6 w-6" aria-hidden />
          <span className="text-xs">画像を読み込めませんでした</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- demo uses external placeholder images with custom fallback handling
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
