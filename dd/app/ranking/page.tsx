"use client";

import { useState } from "react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { RankingList } from "@/components/dd/RankingList";
import { buildRanking } from "@/lib/ranking";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { RankingTab } from "@/types";

const TABS: { id: RankingTab; label: string }[] = [
  { id: "overall", label: "総合" },
  { id: "save", label: "保存" },
  { id: "reproduce", label: "再現" },
  { id: "rating", label: "評価" },
];

// SCREEN 09: Ranking
export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>("overall");
  const { allPlans, statsOf } = useDemoStore();
  const entries = buildRanking(allPlans, tab, statsOf).slice(0, 10);

  return (
    <AppShell>
      <AppHeader title="ランキング" />
      <main className="space-y-4 px-4 py-4">
        <p className="text-sm leading-relaxed text-[var(--dd-gray)]">
          「実際に使われているデート」を評価するランキング。保存・再現・評価から算出しています（デモ用の簡易スコア）。
        </p>
        <div
          role="tablist"
          aria-label="ランキングの種類"
          className="grid grid-cols-4 rounded-full border border-[var(--dd-line)] bg-white p-1"
        >
          {TABS.map((t) => (
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
        <RankingList entries={entries} showScore={tab === "overall"} />
        <p className="text-xs text-[var(--dd-gray)]">
          Demo ranking algorithm：評価×30 + 再現×35 + 保存×25 + レビュー数×10
          で算出（正規化あり）。本番のアルゴリズムではありません。
        </p>
      </main>
    </AppShell>
  );
}
