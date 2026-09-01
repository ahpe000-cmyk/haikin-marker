"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeJapaneseYen, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { CoverImage } from "@/components/dd/CoverImage";
import { DateCard } from "@/components/dd/DateCard";
import { EmptyState } from "@/components/dd/States";
import { DEMO_USER } from "@/data/creators";
import { formatYen } from "@/lib/format";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { DatePlan } from "@/types";

type MyTab = "posts" | "saved" | "history";

// SCREEN 11: My Page
export default function MyPage() {
  const [tab, setTab] = useState<MyTab>("posts");
  const { state, getPlan } = useDemoStore();

  const savedPlans = state.savedDates
    .map((s) => getPlan(s.planId))
    .filter((p): p is DatePlan => p !== undefined);
  const historyPlans = Object.values(state.reproductions)
    .filter((r) => r.status === "completed")
    .map((r) => getPlan(r.planId))
    .filter((p): p is DatePlan => p !== undefined);

  const kpis = [
    { label: "投稿", value: state.myPlans.length },
    { label: "保存", value: state.savedDates.length },
    { label: "再現", value: historyPlans.length },
    { label: "評価", value: state.myReviews.length },
  ];

  // Creator Dashboard — DEMO（実際の報酬・収益は発生しません）
  const demoReward = historyPlans.length * 120 + state.myPlans.length * 300;

  const tabs: { id: MyTab; label: string }[] = [
    { id: "posts", label: "Posts" },
    { id: "saved", label: "Saved" },
    { id: "history", label: "History" },
  ];

  const shown =
    tab === "posts" ? state.myPlans : tab === "saved" ? savedPlans : historyPlans;

  return (
    <AppShell>
      <AppHeader title="マイページ" />
      <main className="space-y-5 px-4 py-5">
        <section className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-neutral-100">
            <CoverImage
              seed={DEMO_USER.avatarSeed}
              alt="あなたのアバター"
              width={128}
              height={128}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold">{DEMO_USER.name}</h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--dd-charcoal)]">
              {DEMO_USER.bio}
            </p>
            <p className="mt-1 text-xs text-[var(--dd-gray)]">
              {DEMO_USER.followers}フォロワー ・{" "}
              {state.followedCreatorIds.length}フォロー中
            </p>
          </div>
        </section>

        <section
          aria-label="アクティビティ"
          className="grid grid-cols-4 gap-2 rounded-2xl border border-[var(--dd-line)] bg-white p-3 text-center"
        >
          {kpis.map((k) => (
            <div key={k.label}>
              <p className="text-lg font-extrabold">{k.value}</p>
              <p className="text-xs text-[var(--dd-gray)]">{k.label}</p>
            </div>
          ))}
        </section>

        {/* SCREEN 22: Creator Monetization (DEMO) */}
        <section
          aria-label="Creator Dashboard（デモ）"
          className="rounded-2xl bg-[var(--dd-ink)] p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <BadgeJapaneseYen
                className="h-4 w-4 text-[var(--dd-accent)]"
                aria-hidden
              />
              Creator Dashboard
            </h2>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wider">
              DEMO
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-white/10 p-2.5">
              <p className="text-lg font-extrabold">{historyPlans.length}</p>
              <p className="text-[11px] text-neutral-300">総再現数</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2.5">
              <p className="text-lg font-extrabold">
                {state.savedDates.length}
              </p>
              <p className="text-[11px] text-neutral-300">保存数</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2.5">
              <p className="text-lg font-extrabold">
                {state.myPlans.length > 0 ? "圏内" : "圏外"}
              </p>
              <p className="text-[11px] text-neutral-300">ランキング</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2.5">
              <p className="text-lg font-extrabold">{formatYen(demoReward)}</p>
              <p className="text-[11px] text-neutral-300">推定報酬（DEMO）</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
            将来的に、良いデートを作るクリエイターが送客・スポンサー等で収益化できる構想のデモ表示です。金額は架空で、実際の報酬は発生しません。
          </p>
        </section>

        <Link
          href="/me/saved"
          className="flex items-center justify-between rounded-2xl border border-[var(--dd-line)] bg-white px-4 py-3 text-sm font-semibold"
        >
          保存したデート一覧
          <ChevronRight className="h-4 w-4 text-[var(--dd-gray)]" aria-hidden />
        </Link>

        <div
          role="tablist"
          aria-label="マイページのコンテンツ"
          className="grid grid-cols-3 rounded-full border border-[var(--dd-line)] bg-white p-1"
        >
          {tabs.map((t) => (
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

        {shown.length === 0 ? (
          tab === "posts" ? (
            <EmptyState
              title="まだ投稿がありません"
              description="あなたの最高のデートを投稿してみましょう。"
              actionLabel="デートを投稿する"
              actionHref="/create"
            />
          ) : tab === "saved" ? (
            <EmptyState
              title="保存したデートがありません"
              description="気になるデートをブックマークするとここに表示されます。"
              actionLabel="デートを探す"
              actionHref="/search"
            />
          ) : (
            <EmptyState
              title="再現したデートがまだありません"
              description="「このデートを再現する」から実際に使ってみましょう。"
              actionLabel="デートを探す"
              actionHref="/home"
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {shown.map((plan) => (
              <DateCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
