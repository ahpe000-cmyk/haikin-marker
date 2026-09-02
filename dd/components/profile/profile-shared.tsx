"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Repeat2, Bookmark, CalendarHeart, Award } from "lucide-react";
import type { Actor } from "@/types";
import { useAppState } from "@/lib/store";
import {
  getDatesByAuthor,
  getPostsByAuthor,
  getReproductionPostsByAuthor,
} from "@/lib/selectors";
import { formatCount } from "@/lib/utils";
import { SmartImage } from "@/components/shared/smart-image";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/states";
import { DateCard } from "@/components/date/date-card";

/** Posts / Followers / Following stat row. */
export function ProfileStats({ actor, postCount }: { actor: Actor; postCount: number }) {
  const { state } = useAppState();
  const followers = actor.followers + (state.following[actor.id] === true ? 1 : 0);
  return (
    <div className="flex justify-around border-y border-line py-3 text-center">
      <div>
        <p className="text-base font-bold tabular-nums">{formatCount(postCount)}</p>
        <p className="text-xs text-muted">Posts</p>
      </div>
      <div>
        <p className="text-base font-bold tabular-nums">{formatCount(followers)}</p>
        <p className="text-xs text-muted">Followers</p>
      </div>
      <div>
        <p className="text-base font-bold tabular-nums">{formatCount(actor.following)}</p>
        <p className="text-xs text-muted">Following</p>
      </div>
    </div>
  );
}

/** DD-specific creator metrics. */
export function DdStats({ actor }: { actor: Actor }) {
  const items = [
    { icon: CalendarHeart, label: "Dates", value: formatCount(actor.dateCount) },
    { icon: Bookmark, label: "Saves", value: formatCount(actor.totalSavesGenerated) },
    {
      icon: Repeat2,
      label: "Reproduced",
      value: formatCount(actor.totalReproductions),
      accent: true,
    },
    {
      icon: Star,
      label: "Rating",
      value: actor.averageRating > 0 ? actor.averageRating.toFixed(1) : "—",
    },
    { icon: Award, label: "DD Score", value: actor.ddScore.toFixed(1) },
  ];
  return (
    <div className="mx-4 mt-4 grid grid-cols-5 rounded-2xl border border-line bg-white py-3">
      {items.map(({ icon: Icon, label, value, accent }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <Icon
            className={`h-4 w-4 ${accent ? "text-accent" : "text-muted"}`}
            aria-hidden
          />
          <p
            className={`text-sm font-bold tabular-nums ${accent ? "text-accent-dark" : ""}`}
          >
            {value}
          </p>
          <p className="text-[10px] text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

type ProfileTab = "posts" | "dates" | "reproductions";

/** Posts (grid) / Dates / Reproductions tab area. */
export function ProfileContent({ actorId }: { actorId: string }) {
  const { state } = useAppState();
  const [tab, setTab] = useState<ProfileTab>("posts");

  const posts = getPostsByAuthor(state, actorId);
  const dates = getDatesByAuthor(state, actorId);
  const reproductions = getReproductionPostsByAuthor(state, actorId);

  return (
    <div className="mt-5">
      <Tabs
        items={[
          { value: "posts", label: `投稿 ${posts.length}` },
          { value: "dates", label: `デート ${dates.length}` },
          { value: "reproductions", label: `再現 ${reproductions.length}` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "posts" &&
        (posts.length === 0 ? (
          <EmptyState title="まだ投稿がありません" />
        ) : (
          <div className="grid grid-cols-3 gap-0.5 pt-0.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                aria-label={post.caption.slice(0, 30)}
                className="relative"
              >
                <SmartImage
                  src={post.media[0]?.url ?? ""}
                  alt={post.caption.slice(0, 30)}
                  aspect="1/1"
                />
                {post.type === "reproduction" && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                    <Repeat2 className="h-3 w-3" aria-hidden />
                  </span>
                )}
                {post.type === "date" && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white">
                    <CalendarHeart className="h-3 w-3" aria-hidden />
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}

      {tab === "dates" &&
        (dates.length === 0 ? (
          <EmptyState title="まだデート投稿がありません" />
        ) : (
          <div className="space-y-3 p-4">
            {dates.map((d) => (
              <DateCard key={d.id} date={d} />
            ))}
          </div>
        ))}

      {tab === "reproductions" &&
        (reproductions.length === 0 ? (
          <EmptyState
            title="まだ再現がありません"
            description="気になるデートを見つけて再現してみましょう"
            actionLabel="デートを探す"
            actionHref="/discover"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4">
            {reproductions.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="overflow-hidden rounded-2xl border border-line bg-white"
              >
                <SmartImage
                  src={post.media[0]?.url ?? ""}
                  alt={post.caption.slice(0, 30)}
                  aspect="1/1"
                />
                <p className="line-clamp-2 p-2.5 text-xs text-muted">{post.caption}</p>
              </Link>
            ))}
          </div>
        ))}
    </div>
  );
}
