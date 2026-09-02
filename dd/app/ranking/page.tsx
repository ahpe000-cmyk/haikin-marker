"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Repeat2, Bookmark, Trophy } from "lucide-react";
import type { Actor } from "@/types";
import { useAppState } from "@/lib/store";
import {
  coupleRanking,
  creatorRanking,
  dateRanking,
  risingRanking,
  type ActorRankingRow,
} from "@/repositories/ranking";
import { getUser } from "@/repositories/actors";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { SmartImage } from "@/components/shared/smart-image";
import { LoadingState } from "@/components/shared/states";
import { actorProfileHref } from "@/components/social/post-header";
import { getPost } from "@/lib/selectors";
import { cn, formatCount } from "@/lib/utils";

type RankingTab = "dates" | "couples" | "creators" | "rising";

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
        rank === 1 && "bg-amber-400 text-white",
        rank === 2 && "bg-zinc-300 text-white",
        rank === 3 && "bg-amber-700/70 text-white",
        rank > 3 && "bg-ink/5 text-ink/60"
      )}
    >
      {rank}
    </span>
  );
}

function ActorRankingList({
  rows,
  statLine,
}: {
  rows: ActorRankingRow[];
  statLine: (actor: Actor, score: number) => string;
}) {
  return (
    <ol className="divide-y divide-line">
      {rows.map(({ rank, actor, score }) => (
        <li key={actor.id}>
          <Link
            href={actorProfileHref(actor.id)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-ink/[0.02]"
          >
            <RankBadge rank={rank} />
            <Avatar src={actor.avatar} name={actor.displayName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{actor.displayName}</p>
              <p className="truncate text-xs text-muted">{statLine(actor, score)}</p>
            </div>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-bold tabular-nums">
                {score.toFixed(1)}
              </span>
              <span className="block text-[10px] text-muted">SCORE</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** SCREEN 10: Ranking — Dates / Couples / Creators / Rising. */
export default function RankingPage() {
  const { state, ready } = useAppState();
  const [tab, setTab] = useState<RankingTab>("dates");

  if (!ready) return <LoadingState variant="list" />;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <Trophy className="h-5 w-5 text-accent" aria-hidden />
          Ranking
        </h1>
        <p className="text-xs text-muted">
          再現された実績を中心に評価するDD独自のランキング（デモ用アルゴリズム）
        </p>
      </header>

      <Tabs
        items={[
          { value: "dates", label: "Dates" },
          { value: "couples", label: "Couples" },
          { value: "creators", label: "Creators" },
          { value: "rising", label: "Rising" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "dates" && (
        <ol className="divide-y divide-line">
          {dateRanking().map(({ rank, date, score }) => {
            const post = getPost(state, date.postId);
            const cover = post?.media[0]?.url ?? date.timeline[0]?.image ?? "";
            return (
              <li key={date.id}>
                <Link
                  href={`/date/${date.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-ink/[0.02]"
                >
                  <RankBadge rank={rank} />
                  <SmartImage
                    src={cover}
                    alt={date.title}
                    aspect="1/1"
                    className="w-14 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{date.title}</p>
                    <p className="mt-0.5 flex items-center gap-2.5 text-xs text-muted">
                      <span className="flex items-center gap-0.5">
                        <Star
                          className="h-3 w-3 fill-amber-400 text-amber-400"
                          aria-hidden
                        />
                        {date.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Bookmark className="h-3 w-3" aria-hidden />
                        {formatCount(date.saveCount)}
                      </span>
                      <span className="flex items-center gap-0.5 font-medium text-accent-dark">
                        <Repeat2 className="h-3 w-3" aria-hidden />
                        {formatCount(date.reproductionCount)}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold tabular-nums">
                      {score.toFixed(1)}
                    </span>
                    <span className="block text-[10px] text-muted">SCORE</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {tab === "couples" && (
        <ActorRankingList
          rows={coupleRanking()}
          statLine={(actor) =>
            `↻ ${formatCount(actor.totalReproductions)} 再現 ・ ★${actor.averageRating.toFixed(1)} ・ ${actor.dateCount} dates`
          }
        />
      )}

      {tab === "creators" && (
        <ActorRankingList
          rows={creatorRanking()}
          statLine={(actor) => {
            const specialty = getUser(actor.id)?.specialty;
            return `${specialty ?? "Creator"} ・ ↻ ${formatCount(actor.totalReproductions)} 再現 ・ ${actor.dateCount} dates`;
          }}
        />
      )}

      {tab === "rising" && (
        <>
          <p className="px-4 pt-3 text-xs text-muted">
            最近伸びているCreator。再現効率をもとに、大手だけが固定上位にならないよう補正しています。
          </p>
          <ActorRankingList
            rows={risingRanking()}
            statLine={(actor) =>
              `↻ ${formatCount(actor.totalReproductions)} 再現 / ${actor.dateCount} dates`
            }
          />
        </>
      )}
    </>
  );
}
