"use client";

import Link from "next/link";
import { CoverImage } from "@/components/dd/CoverImage";
import { FollowButton } from "@/components/dd/FollowButton";
import { formatCount } from "@/lib/format";
import type { CreatorProfile } from "@/types";

export function CreatorCard({ creator }: { creator: CreatorProfile }) {
  return (
    <article className="relative w-40 shrink-0 rounded-2xl border border-[var(--dd-line)] bg-white p-3 text-center shadow-sm">
      <Link
        href={`/creator/${creator.id}`}
        aria-label={`${creator.name} のプロフィールを見る`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dd-accent)]"
      />
      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-neutral-100">
        <CoverImage
          seed={creator.avatarSeed}
          alt={`${creator.name}のアバター`}
          width={128}
          height={128}
        />
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-bold">{creator.name}</p>
      <p className="mt-0.5 text-xs text-[var(--dd-gray)]">
        {formatCount(creator.followers)}フォロワー
      </p>
      <p className="text-xs text-[var(--dd-gray)]">
        再現{formatCount(creator.totalReproductions)}回
      </p>
      <div className="relative z-[2] mt-2">
        <FollowButton creatorId={creator.id} size="sm" />
      </div>
    </article>
  );
}
