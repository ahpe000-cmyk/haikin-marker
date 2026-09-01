"use client";

import { useDemoStore } from "@/hooks/useDemoStore";
import { useToast } from "@/components/dd/Toast";

export function FollowButton({
  creatorId,
  size = "md",
}: {
  creatorId: string;
  size?: "sm" | "md";
}) {
  const { isFollowing, toggleFollow } = useDemoStore();
  const { showToast } = useToast();
  const following = isFollowing(creatorId);

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow(creatorId);
        showToast(following ? "フォローを解除しました" : "フォローしました");
      }}
      className={`rounded-full font-semibold transition-colors ${
        size === "sm" ? "px-3 py-1 text-xs" : "px-5 py-2 text-sm"
      } ${
        following
          ? "border border-[var(--dd-line)] bg-white text-[var(--dd-charcoal)]"
          : "bg-[var(--dd-ink)] text-white"
      }`}
    >
      {following ? "フォロー中" : "フォローする"}
    </button>
  );
}
