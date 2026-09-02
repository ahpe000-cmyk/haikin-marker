"use client";

import { useState } from "react";
import { Bookmark, Repeat2, Users } from "lucide-react";
import { useAppState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    icon: Users,
    title: "デートを共有するSNS",
    body: "個人も、カップルも。実際に体験したデートを投稿して、誰かの参考になる。",
  },
  {
    icon: Bookmark,
    title: "気になるデートを保存",
    body: "エリア・予算・タイムラインまで分かるから、「今度これやろう」がすぐ見つかる。",
  },
  {
    icon: Repeat2,
    title: "そのまま再現",
    body: "保存したデートをそのまま再現。あなたの再現が、元のCreatorの実績になる。",
  },
] as const;

/** First-launch onboarding overlay (max 3 pages, skippable). */
export function Onboarding() {
  const { state, dispatch, ready } = useAppState();
  const [index, setIndex] = useState(0);

  if (!ready || state.onboarded) return null;

  const finish = () => dispatch({ type: "MARK_ONBOARDED" });
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-app flex-col bg-paper px-6 pb-10 pt-16">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-black tracking-tight">DD</span>
        <button
          type="button"
          onClick={finish}
          className="min-h-11 px-2 text-sm text-muted hover:text-ink"
        >
          スキップ
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft">
          <Icon className="h-12 w-12 text-accent" strokeWidth={1.6} aria-hidden />
        </span>
        <h1 className="text-[28px] font-bold leading-snug">{slide.title}</h1>
        <p className="max-w-xs text-[15px] leading-relaxed text-muted">{slide.body}</p>
      </div>

      <div className="mb-6 flex justify-center gap-2" aria-hidden>
        {SLIDES.map((s, i) => (
          <span
            key={s.title}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-ink" : "w-2 bg-ink/20"
            )}
          />
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
      >
        {isLast ? "DDをはじめる" : "次へ"}
      </Button>
    </div>
  );
}
