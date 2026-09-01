"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bookmark,
  Clock,
  Footprints,
  MapPin,
  Quote,
  RotateCw,
  Wallet,
} from "lucide-react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { CoverImage } from "@/components/dd/CoverImage";
import { Rating } from "@/components/dd/Rating";
import { ReportBlockMenu } from "@/components/dd/ReportBlockMenu";
import { SaveButton } from "@/components/dd/SaveButton";
import { ErrorState } from "@/components/dd/States";
import { Tag } from "@/components/dd/Tag";
import { Timeline } from "@/components/dd/Timeline";
import { AREA_LABELS } from "@/data/meta";
import { CREATOR_MAP, DEMO_USER } from "@/data/creators";
import { SEED_REVIEWS } from "@/data/reviews";
import {
  formatBudgetRange,
  formatCount,
  formatDuration,
  formatYen,
} from "@/lib/format";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { DateReview } from "@/types";

function ReviewCard({ review }: { review: DateReview }) {
  return (
    <li className="rounded-2xl border border-[var(--dd-line)] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{review.authorName}</p>
        <Rating value={review.overall} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--dd-charcoal)]">
        {review.comment}
      </p>
      <p className="mt-2 text-xs text-[var(--dd-gray)]">
        雰囲気 {review.atmosphere} ・ コスパ {review.costPerformance} ・
        再現しやすさ {review.reproducibility} ・ また使いたい:{" "}
        {review.wouldUseAgain ? "はい" : "いいえ"}
      </p>
    </li>
  );
}

// SCREEN 05: Date Detail
export default function DateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getPlan, statsOf, state, beginReproduction, hydrated } =
    useDemoStore();

  const plan = getPlan(id);
  if (!plan) {
    return (
      <AppShell>
        <AppHeader showBack title="デート詳細" />
        {/* localStorage読込前に投稿プランを404扱いしない */}
        {hydrated && <ErrorState title="このデートは見つかりません" />}
      </AppShell>
    );
  }

  const stats = statsOf(plan);
  const creator = CREATOR_MAP[plan.creatorId];
  const creatorName = plan.isUserPost ? DEMO_USER.name : (creator?.name ?? "unknown");
  const totalCost = plan.stops.reduce((acc, s) => acc + s.estimatedCost, 0);
  const moveCount = Math.max(0, plan.stops.length - 1);
  const reviews = [
    ...state.myReviews.filter((r) => r.planId === plan.id),
    ...SEED_REVIEWS.filter((r) => r.planId === plan.id),
  ];

  const handleReproduce = () => {
    beginReproduction(plan.id);
    router.push(`/date/${plan.id}/reproduce`);
  };

  return (
    <AppShell>
      <AppHeader
        showBack
        title="デート詳細"
        rightSlot={<ReportBlockMenu targetName={plan.title} />}
      />
      <main className="pb-24">
        {/* A. Cover */}
        <div className="aspect-video w-full overflow-hidden bg-neutral-100">
          <CoverImage
            seed={plan.coverImageSeed}
            alt={plan.title}
            width={1280}
            height={720}
          />
        </div>

        <div className="space-y-6 px-4 py-5">
          {/* B. Basic Information */}
          <section>
            <h1 className="text-2xl font-extrabold leading-snug">
              {plan.title}
            </h1>
            <Link
              href={plan.isUserPost ? "/me" : `/creator/${plan.creatorId}`}
              className="mt-2 inline-block text-sm text-[var(--dd-gray)] underline-offset-2 hover:underline"
            >
              by {creatorName}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--dd-charcoal)]">
              <Rating value={stats.rating} />
              <span className="text-xs text-[var(--dd-gray)]">
                {stats.reviewCount}件の評価
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--dd-gray)]">
                <Bookmark className="h-3.5 w-3.5" aria-hidden />
                {formatCount(stats.saveCount)}保存
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--dd-gray)]">
                <RotateCw className="h-3.5 w-3.5" aria-hidden />
                {formatCount(stats.reproduceCount)}回再現
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-[var(--dd-gray)]" aria-hidden />
                {AREA_LABELS[plan.area]}
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-4 w-4 text-[var(--dd-gray)]" aria-hidden />
                {formatBudgetRange(plan.budgetMin, plan.budgetMax)} / 1人
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4 text-[var(--dd-gray)]" aria-hidden />
                {formatDuration(plan.durationMinutes)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {plan.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--dd-charcoal)]">
              {plan.description}
            </p>
          </section>

          {/* C. Creator Comment */}
          <section className="rounded-2xl bg-[var(--dd-accent-soft)] p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Quote className="h-4 w-4 text-[var(--dd-accent)]" aria-hidden />
              このデートを作った理由
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dd-charcoal)]">
              {plan.creatorComment}
            </p>
          </section>

          {/* D. Date Timeline */}
          <section>
            <h2 className="mb-4 text-lg font-bold">デートの流れ</h2>
            <Timeline stops={plan.stops} />
          </section>

          {/* E. Total */}
          <section className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--dd-line)] bg-white p-4 text-sm">
            <div>
              <p className="text-xs text-[var(--dd-gray)]">合計時間</p>
              <p className="font-bold">{formatDuration(plan.durationMinutes)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--dd-gray)]">1人あたり予算目安</p>
              <p className="font-bold">{formatYen(totalCost)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--dd-gray)]">移動回数</p>
              <p className="inline-flex items-center gap-1 font-bold">
                <Footprints className="h-4 w-4" aria-hidden />
                {moveCount}回
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--dd-gray)]">スポット数</p>
              <p className="font-bold">{plan.stops.length} Stops</p>
            </div>
          </section>

          {/* F. Creator Tips */}
          {plan.tips.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">
                このデートを成功させるポイント
              </h2>
              <ul className="space-y-2">
                {plan.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-2 rounded-xl border border-[var(--dd-line)] bg-white px-3 py-2.5 text-sm"
                  >
                    <span className="text-[var(--dd-accent)]" aria-hidden>
                      ✓
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* G. Reviews */}
          <section>
            <h2 className="mb-3 text-lg font-bold">みんなの評価</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-[var(--dd-gray)]">
                まだ評価がありません。最初のレビューを投稿しましょう。
              </p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      {/* H. Sticky CTA */}
      <div className="fixed inset-x-0 bottom-[calc(3.4rem+env(safe-area-inset-bottom))] z-40 border-t border-[var(--dd-line)] bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto grid w-full max-w-md grid-cols-[1fr_auto] gap-2 lg:max-w-2xl">
          <button
            type="button"
            onClick={handleReproduce}
            className="h-12 rounded-xl bg-[var(--dd-accent)] text-base font-bold text-white transition-transform active:scale-[0.98]"
          >
            このデートを再現する
          </button>
          <SaveButton planId={plan.id} variant="button" />
        </div>
      </div>
    </AppShell>
  );
}
