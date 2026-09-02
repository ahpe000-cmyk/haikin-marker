"use client";

import { useAppState } from "@/lib/store";
import { isFollowing } from "@/lib/state";
import { useToast } from "@/components/ui/toast";
import { getActor } from "@/repositories/actors";
import { cn } from "@/lib/utils";

export function FollowButton({
  actorId,
  size = "sm",
  className,
}: {
  actorId: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { state, dispatch } = useAppState();
  const toast = useToast();
  const following = isFollowing(state, actorId);
  const actor = getActor(actorId);

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => {
        dispatch({ type: "TOGGLE_FOLLOW", actorId, baseFollowing: false });
        toast(
          following
            ? `${actor?.displayName ?? ""}のフォローを解除しました`
            : `${actor?.displayName ?? ""}をフォローしました`
        );
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors",
        size === "sm" ? "h-8 px-3.5 text-xs" : "h-11 px-6 text-sm",
        following
          ? "border border-line bg-white text-muted hover:text-ink"
          : "bg-ink text-white hover:bg-ink/90",
        className
      )}
    >
      {following ? "フォロー中" : "フォロー"}
    </button>
  );
}
