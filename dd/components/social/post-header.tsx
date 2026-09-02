"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, MapPin } from "lucide-react";
import type { Post } from "@/types";
import { getActor } from "@/repositories/actors";
import { DEMO_USER_ID } from "@/data/mock";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FollowButton } from "./follow-button";
import { useAppState } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

export function actorProfileHref(actorId: string): string {
  if (actorId === DEMO_USER_ID) return "/me";
  return actorId.startsWith("c") ? `/couple/${actorId}` : `/profile/${actorId}`;
}

export function PostHeader({ post }: { post: Post }) {
  const actor = getActor(post.authorId);
  const { dispatch } = useAppState();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<"report" | "block" | null>(null);
  const isSelf = post.authorId === DEMO_USER_ID;

  if (!actor) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Link href={actorProfileHref(actor.id)} className="shrink-0">
        <Avatar src={actor.avatar} name={actor.displayName} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={actorProfileHref(actor.id)}
          className="flex items-center gap-1.5"
        >
          <span className="truncate text-sm font-semibold">{actor.displayName}</span>
          <Badge variant={actor.type === "couple" ? "couple" : "default"}>
            {actor.type === "couple" ? "Couple" : "Individual"}
          </Badge>
        </Link>
        {post.location && (
          <p className="flex items-center gap-0.5 text-xs text-muted">
            <MapPin className="h-3 w-3" aria-hidden />
            {post.location}
          </p>
        )}
      </div>
      {!isSelf && <FollowButton actorId={actor.id} />}
      <button
        type="button"
        aria-label="投稿メニュー"
        onClick={() => setMenuOpen(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/5"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </button>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="投稿メニュー">
        <div className="space-y-1">
          <button
            type="button"
            className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-ink/5"
            onClick={() => {
              setMenuOpen(false);
              setConfirm("report");
            }}
          >
            この投稿を報告
          </button>
          {!isSelf && (
            <button
              type="button"
              className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                setConfirm("block");
              }}
            >
              {actor.displayName}をブロック
            </button>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirm === "report"}
        title="投稿を報告しますか？"
        description="この投稿を運営チームに報告します。報告した投稿はフィードに表示されなくなります。"
        confirmLabel="報告する"
        destructive
        onConfirm={() => {
          dispatch({ type: "REPORT_POST", postId: post.id });
          toast("投稿を報告しました");
        }}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "block"}
        title={`${actor.displayName}をブロックしますか？`}
        description="ブロックすると、このアカウントの投稿はフィードや検索結果に表示されなくなります。"
        confirmLabel="ブロックする"
        destructive
        onConfirm={() => {
          dispatch({ type: "BLOCK_ACTOR", actorId: actor.id });
          toast(`${actor.displayName}をブロックしました`);
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
