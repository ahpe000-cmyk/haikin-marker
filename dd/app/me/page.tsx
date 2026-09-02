"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, MapPin, Share2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getPostsByAuthor } from "@/lib/selectors";
import { getUser } from "@/repositories/actors";
import { DEMO_USER_ID } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import {
  DdStats,
  ProfileContent,
  ProfileStats,
} from "@/components/profile/profile-shared";
import { LoadingState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

/** SCREEN 13: My Page (demo operator account). */
export default function MyProfilePage() {
  const { state, ready, dispatch } = useAppState();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftBio, setDraftBio] = useState("");

  if (!ready) {
    return (
      <>
        <PageHeader title="マイページ" />
        <LoadingState variant="profile" />
      </>
    );
  }

  const base = getUser(DEMO_USER_ID);
  if (!base) return null;
  const user = {
    ...base,
    displayName: state.profileOverrides.displayName || base.displayName,
    bio: state.profileOverrides.bio || base.bio,
  };
  const posts = getPostsByAuthor(state, user.id);

  return (
    <>
      <PageHeader
        title="マイページ"
        action={
          <Link
            href="/me/saved"
            aria-label="保存済み"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
          >
            <Bookmark className="h-5 w-5" aria-hidden />
          </Link>
        }
      />
      <div className="px-4 pt-5">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar} name={user.displayName} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              {user.displayName}
              <Badge>Individual</Badge>
            </h1>
            <p className="text-sm text-muted">@{user.username}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {user.location}
        </p>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setDraftName(user.displayName);
              setDraftBio(user.bio);
              setEditOpen(true);
            }}
          >
            プロフィールを編集
          </Button>
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
        <ProfileStats actor={user} postCount={posts.length} />
        <DdStats actor={user} />
        <ProfileContent actorId={user.id} />
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="プロフィールを編集">
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="mb-1.5 block text-sm font-medium">
              表示名
            </label>
            <Input
              id="edit-name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="edit-bio" className="mb-1.5 block text-sm font-medium">
              自己紹介
            </label>
            <Textarea
              id="edit-bio"
              rows={3}
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              maxLength={150}
            />
          </div>
          <Button
            className="w-full"
            disabled={!draftName.trim()}
            onClick={() => {
              dispatch({
                type: "UPDATE_PROFILE",
                displayName: draftName.trim(),
                bio: draftBio.trim(),
              });
              setEditOpen(false);
              toast("プロフィールを更新しました");
            }}
          >
            保存
          </Button>
        </div>
      </Dialog>
    </>
  );
}
