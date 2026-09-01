"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { CoverImage } from "@/components/dd/CoverImage";
import { DateCard } from "@/components/dd/DateCard";
import { FollowButton } from "@/components/dd/FollowButton";
import { ReportBlockMenu } from "@/components/dd/ReportBlockMenu";
import { ErrorState, EmptyState } from "@/components/dd/States";
import { CREATOR_MAP } from "@/data/creators";
import { PLANS } from "@/data/plans";
import { formatCount } from "@/lib/format";
import { useDemoStore } from "@/hooks/useDemoStore";

type CreatorTab = "dates" | "popular";

// SCREEN 10: Creator Profile
export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<CreatorTab>("dates");
  const { isFollowing } = useDemoStore();

  const creator = CREATOR_MAP[id];
  if (!creator) {
    return (
      <AppShell>
        <AppHeader showBack title="クリエイター" />
        <ErrorState title="このクリエイターは見つかりません" />
      </AppShell>
    );
  }

  const plans = PLANS.filter((p) => p.creatorId === creator.id);
  const shown =
    tab === "popular"
      ? [...plans].sort((a, b) => b.reproduceCount - a.reproduceCount)
      : [...plans].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
  const followers = creator.followers + (isFollowing(creator.id) ? 1 : 0);

  return (
    <AppShell>
      <AppHeader
        showBack
        title="クリエイター"
        rightSlot={<ReportBlockMenu targetName={creator.name} />}
      />
      <main className="px-4 py-5">
        <section className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-100">
            <CoverImage
              seed={creator.avatarSeed}
              alt={`${creator.name}のアバター`}
              width={160}
              height={160}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold leading-snug">
              {creator.name}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--dd-charcoal)]">
              {creator.bio}
            </p>
          </div>
        </section>

        <section
          aria-label="クリエイターの実績"
          className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-[var(--dd-line)] bg-white p-3 text-center"
        >
          <div>
            <p className="text-lg font-extrabold">{formatCount(followers)}</p>
            <p className="text-xs text-[var(--dd-gray)]">フォロワー</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">
              {formatCount(creator.following)}
            </p>
            <p className="text-xs text-[var(--dd-gray)]">フォロー中</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">{creator.totalDates}</p>
            <p className="text-xs text-[var(--dd-gray)]">投稿デート</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">
              {formatCount(creator.totalReproductions)}
            </p>
            <p className="text-xs text-[var(--dd-gray)]">総再現数</p>
          </div>
          <div className="col-span-2">
            <p className="text-lg font-extrabold">
              ★ {creator.averageRating.toFixed(1)}
            </p>
            <p className="text-xs text-[var(--dd-gray)]">平均評価</p>
          </div>
        </section>

        <div className="mt-4">
          <FollowButton creatorId={creator.id} />
        </div>

        <div
          role="tablist"
          aria-label="投稿の並び替え"
          className="mt-6 grid grid-cols-2 rounded-full border border-[var(--dd-line)] bg-white p-1"
        >
          {(
            [
              { id: "dates", label: "デート" },
              { id: "popular", label: "人気順" },
            ] as { id: CreatorTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-[var(--dd-ink)] text-white"
                  : "text-[var(--dd-gray)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {shown.length === 0 ? (
            <EmptyState title="まだ投稿がありません" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {shown.map((plan) => (
                <DateCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
