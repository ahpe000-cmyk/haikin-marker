"use client";

import { useParams } from "next/navigation";
import { MapPin, Share2, HeartHandshake } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getPostsByAuthor } from "@/lib/selectors";
import { getCouple } from "@/repositories/actors";
import { actorRankPosition } from "@/repositories/ranking";
import { PageHeader } from "@/components/shared/page-header";
import { SmartImage } from "@/components/shared/smart-image";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/social/follow-button";
import {
  DdStats,
  ProfileContent,
  ProfileStats,
} from "@/components/profile/profile-shared";
import { ErrorState, LoadingState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

function formatDatingSince(iso: string): string {
  const start = new Date(iso);
  const months = Math.max(
    0,
    (new Date().getFullYear() - start.getFullYear()) * 12 +
      new Date().getMonth() -
      start.getMonth()
  );
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `交際${rest}ヶ月`;
  if (rest === 0) return `交際${years}年`;
  return `交際${years}年${rest}ヶ月`;
}

/** SCREEN 11: Couple Profile — visually distinct from individual profiles. */
export default function CoupleProfilePage() {
  const params = useParams<{ id: string }>();
  const { state, ready } = useAppState();
  const toast = useToast();

  if (!ready) {
    return (
      <>
        <PageHeader title="Couple" />
        <LoadingState variant="profile" />
      </>
    );
  }

  const couple = getCouple(params.id);
  if (!couple) {
    return (
      <>
        <PageHeader title="Couple" />
        <ErrorState title="Coupleが見つかりません" />
      </>
    );
  }

  const posts = getPostsByAuthor(state, couple.id);
  const rank = actorRankPosition(couple.id);

  return (
    <>
      <PageHeader title={couple.displayName} />

      {/* Cover image differentiates couple profiles */}
      <div className="relative">
        <SmartImage src={couple.coverImage} alt="" aspect="2/1" />
        <div className="absolute -bottom-8 left-4">
          <Avatar
            src={couple.avatar}
            name={couple.displayName}
            size="xl"
            className="ring-4 ring-paper"
          />
        </div>
      </div>

      <div className="px-4 pt-11">
        <h1 className="flex flex-wrap items-center gap-2 text-lg font-bold">
          {couple.memberNames[0]}
          <span className="text-muted">×</span>
          {couple.memberNames[1]}
          <Badge variant="couple">Couple</Badge>
          {rank !== undefined && rank <= 10 && (
            <Badge variant="accent">Couple Ranking {rank}位</Badge>
          )}
        </h1>
        <p className="text-sm text-muted">@{couple.username}</p>

        <p className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
            {formatDatingSince(couple.datingSince)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {couple.location}
          </span>
        </p>

        <p className="mt-3 text-sm leading-relaxed">{couple.bio}</p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {couple.favoriteDateStyles.map((style) => (
            <Badge key={style} variant="outline">
              #{style}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <FollowButton actorId={couple.id} size="md" className="flex-1" />
          <button
            type="button"
            aria-label="プロフィールを共有"
            onClick={() => toast("プロフィールのリンクをコピーしました（デモ）")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white hover:bg-ink/5"
          >
            <Share2 className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <ProfileStats
          actor={couple}
          postCount={Math.max(couple.postCount, posts.length)}
        />
        <DdStats actor={couple} />
        <ProfileContent actorId={couple.id} />
      </div>
    </>
  );
}
