"use client";

import { useState } from "react";
import { coverImageUrl, fallbackGradient } from "@/lib/image";

interface CoverImageProps {
  seed: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

// ネットワーク画像＋ロード失敗時のグラデーションフォールバック。
// デモのためNext/Imageの最適化は使わない。
export function CoverImage({
  seed,
  alt,
  className = "",
  width = 800,
  height = 600,
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} h-full w-full`}
        style={{ background: fallbackGradient(seed) }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- デモ用の外部プレースホルダー画像（fallbackあり）
    <img
      src={coverImageUrl(seed, width, height)}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} h-full w-full object-cover`}
      style={{ background: fallbackGradient(seed) }}
    />
  );
}
