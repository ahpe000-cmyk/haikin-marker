"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Bookmark, Repeat2, Star, Lightbulb, MapPin, Clock, Wallet } from "lucide-react";
import { useAppState } from "@/lib/store";
import {
  getDate,
  getPost,
  getReproductionsOfDate,
  getAllPosts,
} from "@/lib/selectors";
import { isDateSaved } from "@/lib/state";
import { getActor } from "@/repositories/actors";
import { listMockReviews } from "@/repositories/comments";
import { SCENE_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/shared/page-header";
import { SmartImage } from "@/components/shared/smart-image";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/date/timeline";
import { FollowButton } from "@/components/social/follow-button";
import { actorProfileHref } from "@/components/social/post-header";
import { ErrorState, LoadingState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";
import {
  cn,
  formatBudget,
  formatCount,
  formatDuration,
  formatRelativeTime,
} from "@/lib/utils";

/** SCREEN 06: Date Detail — structured date experience view. */
export default function DateDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, ready, dispatch } = useAppState();
  const toast = useToast();

  if (!ready) {
    return (
      <>
        <PageHeader title="デート詳細" />
        <LoadingState variant="feed" />
      </>
    );
  }

  const date = getDate(state, params.id);
  if (!date) {
    return (
      <>
        <PageHeader title="デート詳細" />
        <ErrorState title="デートが見つかりません" />
      </>
    );
  }

  const post = getPost(state, date.postId);
  const author = post ? getActor(post.authorId) : undefined;
  const saved = isDateSaved(state, date.id);
  const reproductions = getReproductionsOfDate(state, date.id);
  const reproductionPosts = getAllPosts(state).filter(
    (p) => p.type === "reproduction" && p.originalDateId === date.id
  );
  const reviews = listMockReviews(date.id);
  const heroImage = post?.media[0]?.url ?? date.timeline[0]?.image ?? "";

  return (
    <>
      <PageHeader title="デート詳細" />

      <SmartImage src={heroImage} alt={date.title} aspect="4/3" priority />

      <div className="px-4 pb-32 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="accent">{SCENE_LABELS[date.scene]}</Badge>
          {date.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>

        <h1 className="mt-2 text-[22px] font-bold leading-snug">{date.title}</h1>

        {author && (
          <div className="mt-3 flex items-center gap-3">
            <Link href={actorProfileHref(author.id)}>
              <Avatar src={author.avatar} name={author.displayName} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={actorProfileHref(author.id)}
                className="block truncate text-sm font-semibold"
              >
                {author.displayName}
              </Link>
              <p className="text-xs text-muted">
                {author.type === "couple" ? "Couple Creator" : "Creator"}
              </p>
            </div>
            <FollowButton actorId={author.id} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white py-3 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-base font-bold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {date.rating.toFixed(1)}
            </p>
            <p className="text-[11px] text-muted">評価 ({date.reviewCount})</p>
          </div>
          <div>
            <p className="text-base font-bold tabular-nums">{formatCount(date.saveCount + (saved ? 1 : 0))}</p>
            <p className="text-[11px] text-muted">保存</p>
          </div>
          <div>
            <p className="text-base font-bold tabular-nums text-accent-dark">
              {formatCount(date.reproductionCount)}
            </p>
            <p className="text-[11px] text-muted">再現</p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <dt className="flex w-24 items-center gap-1.5 text-muted">
              <MapPin className="h-4 w-4" aria-hidden />
              エリア
            </dt>
            <dd className="font-medium">{date.area}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="flex w-24 items-center gap-1.5 text-muted">
              <Wallet className="h-4 w-4" aria-hidden />
              予算
            </dt>
            <dd className="font-medium">
              {formatBudget(date.budgetMin, date.budgetMax)} / 1人
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="flex w-24 items-center gap-1.5 text-muted">
              <Clock className="h-4 w-4" aria-hidden />
              所要時間
            </dt>
            <dd className="font-medium">約{formatDuration(date.durationMinutes)}</dd>
          </div>
        </dl>

        <section className="mt-6">
          <h2 className="text-base font-bold">タイムライン</h2>
          <Timeline stops={date.timeline} />
        </section>

        {date.tips.length > 0 && (
          <section className="mt-6 rounded-2xl bg-amber-50 p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-amber-900">
              <Lightbulb className="h-4 w-4" aria-hidden />
              Creatorからのアドバイス
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-amber-900/90">
              {date.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold">再現したユーザーのレビュー</h2>
            <ul className="mt-3 space-y-4">
              {reviews.map((review) => {
                const reviewer = getActor(review.authorId);
                return (
                  <li key={review.id} className="rounded-2xl border border-line bg-white p-3.5">
                    <div className="flex items-center gap-2.5">
                      {reviewer && (
                        <Avatar src={reviewer.avatar} name={reviewer.displayName} size="sm" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {reviewer?.displayName ?? "ユーザー"}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted">
                          <span className="flex" aria-label={`評価 ${review.rating} / 5`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-line"
                                )}
                                aria-hidden
                              />
                            ))}
                          </span>
                          {formatRelativeTime(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{review.text}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {reproductionPosts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold">
              このデートを再現した投稿
              <span className="ml-2 text-sm font-medium text-accent-dark">
                ↻ {formatCount(date.reproductionCount)} reproductions
              </span>
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {reproductionPosts.slice(0, 6).map((p) => {
                const reproducer = getActor(p.authorId);
                return (
                  <Link
                    key={p.id}
                    href={`/post/${p.id}`}
                    className="overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    <SmartImage src={p.media[0]?.url ?? ""} alt={p.caption} aspect="1/1" />
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold">
                        {reproducer?.displayName ?? ""}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{p.caption}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {reproductions.length === 0 && reproductionPosts.length === 0 && (
          <p className="mt-6 rounded-2xl bg-ink/5 p-4 text-center text-sm text-muted">
            まだ再現投稿がありません。最初の再現者になりましょう。
          </p>
        )}
      </div>

      {/* Sticky CTA: Save (later) vs Reproduce (do it) are distinct actions */}
      <div className="fixed inset-x-0 bottom-14 z-30 mx-auto flex w-full max-w-app gap-2 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => {
            dispatch({ type: "TOGGLE_SAVE_DATE", dateId: date.id });
            toast(saved ? "保存を解除しました" : "デートを保存しました（あとで見る）");
          }}
          className={cn(
            "flex h-12 w-28 items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition-colors",
            saved
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-ink hover:bg-ink/5"
          )}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-white")} aria-hidden />
          {saved ? "保存済み" : "保存"}
        </button>
        <Link
          href={`/date/${date.id}/reproduce`}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent text-sm font-bold text-white hover:bg-accent-dark"
        >
          <Repeat2 className="h-5 w-5" aria-hidden />
          このデートを再現する
        </Link>
      </div>
    </>
  );
}
