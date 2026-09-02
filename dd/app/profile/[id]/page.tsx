"use client";

import { useParams, useRouter } from "next/navigation";
import { MapPin, Share2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getPostsByAuthor } from "@/lib/selectors";
import { getUser } from "@/repositories/actors";
import { DEMO_USER_ID } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
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
import { useEffect } from "react";

/** SCREEN 12: Individual Profile. */
export default function IndividualProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, ready } = useAppState();
  const toast = useToast();
  const isSelf = params.id === DEMO_USER_ID;

  // The demo user's own profile lives at /me
  useEffect(() => {
    if (isSelf) router.replace("/me");
  }, [isSelf, router]);

  if (!ready || isSelf) {
    return (
      <>
        <PageHeader title="プロフィール" />
        <LoadingState variant="profile" />
      </>
    );
  }

  const user = getUser(params.id);
  if (!user) {
    return (
      <>
        <PageHeader title="プロフィール" />
        <ErrorState title="ユーザーが見つかりません" />
      </>
    );
  }

  const posts = getPostsByAuthor(state, user.id);

  return (
    <>
      <PageHeader title={user.displayName} />
      <div className="px-4 pt-5">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar} name={user.displayName} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              {user.displayName}
              <Badge>Individual</Badge>
            </h1>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.specialty && (
              <Badge variant="accent" className="mt-1">
                {user.specialty}
              </Badge>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {user.location}
        </p>

        <div className="mt-4 flex gap-2">
          <FollowButton actorId={user.id} size="md" className="flex-1" />
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
        <ProfileStats actor={user} postCount={Math.max(user.postCount, posts.length)} />
        <DdStats actor={user} />
        <ProfileContent actorId={user.id} />
      </div>
    </>
  );
}
