"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PartyPopper, Play, Repeat2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getDate, getPost } from "@/lib/selectors";
import { getActor } from "@/repositories/actors";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/date/timeline";
import { ErrorState, LoadingState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";
import { formatDuration, formatYen } from "@/lib/utils";

/** SCREEN 07 + 08: Reproduce Date flow (start → progress → complete). */
export default function ReproduceDatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, ready, dispatch } = useAppState();
  const toast = useToast();

  if (!ready) {
    return (
      <>
        <PageHeader title="デートを再現" />
        <LoadingState variant="list" />
      </>
    );
  }

  const date = getDate(state, params.id);
  if (!date) {
    return (
      <>
        <PageHeader title="デートを再現" />
        <ErrorState title="デートが見つかりません" />
      </>
    );
  }

  const post = getPost(state, date.postId);
  const author = post ? getActor(post.authorId) : undefined;
  const progress = state.reproProgress[date.id];
  const inProgress = progress !== undefined && !progress.finished;
  const finished = progress?.finished === true;
  const totalStops = date.timeline.length;
  const completedCount = progress?.completedStops.length ?? 0;
  const totalCost = date.timeline.reduce((sum, s) => sum + s.estimatedCost, 0);

  // --- SCREEN 08: Reproduction Complete -----------------------------------
  if (finished) {
    return (
      <>
        <PageHeader title="デート完了" />
        <div className="flex flex-col items-center px-6 pb-10 pt-14 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft">
            <PartyPopper className="h-12 w-12 text-accent" strokeWidth={1.6} aria-hidden />
          </span>
          <h1 className="mt-6 text-[26px] font-bold">デート完了！</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            「{date.title}」の全{totalStops} Stopsを回りました。
            <br />
            体験を投稿すると、
            {author ? `${author.displayName}さん` : "元のCreator"}
            に再現実績が還元されます。
          </p>

          <div className="mt-8 w-full space-y-3">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => router.push(`/create?reproduce=${date.id}`)}
            >
              このデートを投稿する
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted"
              onClick={() => {
                dispatch({ type: "RESET_REPRODUCTION", dateId: date.id });
                router.push(`/date/${date.id}`);
              }}
            >
              投稿せずに終了する
            </Button>
          </div>
        </div>
      </>
    );
  }

  // --- SCREEN 07: overview / in-progress ----------------------------------
  return (
    <>
      <PageHeader title={inProgress ? "デート進行中" : "デートを再現"} />

      {inProgress && (
        <div className="sticky top-[57px] z-20 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>進行状況</span>
            <span className="tabular-nums text-accent-dark">
              {completedCount} / {totalStops}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalStops}
            aria-valuenow={completedCount}
            className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${(completedCount / totalStops) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="px-4 pb-32 pt-4">
        <h1 className="text-xl font-bold leading-snug">{date.title}</h1>

        {author && (
          <Link
            href={author.type === "couple" ? `/couple/${author.id}` : `/profile/${author.id}`}
            className="mt-3 flex items-center gap-2.5"
          >
            <Avatar src={author.avatar} name={author.displayName} size="sm" />
            <span className="text-sm text-muted">
              Original Creator：
              <span className="font-semibold text-ink">{author.displayName}</span>
            </span>
          </Link>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl border border-line bg-white py-3">
            <p className="text-base font-bold">{formatYen(totalCost)}</p>
            <p className="text-[11px] text-muted">予想合計（1人）</p>
          </div>
          <div className="rounded-2xl border border-line bg-white py-3">
            <p className="text-base font-bold">約{formatDuration(date.durationMinutes)}</p>
            <p className="text-[11px] text-muted">予想所要時間</p>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-base font-bold">
            Stops（{totalStops}箇所）
          </h2>
          <Timeline
            stops={date.timeline}
            completedOrders={inProgress ? progress.completedStops : undefined}
            onCompleteStop={
              inProgress
                ? (order) => {
                    dispatch({
                      type: "COMPLETE_STOP",
                      dateId: date.id,
                      stopOrder: order,
                      totalStops,
                    });
                    if (completedCount + 1 >= totalStops) {
                      toast("全Stops完了！おつかれさまでした");
                    }
                  }
                : undefined
            }
          />
        </section>
      </div>

      {!inProgress && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-app border-t border-line bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            onClick={() => {
              dispatch({
                type: "START_REPRODUCTION",
                dateId: date.id,
                startedAt: new Date().toISOString(),
              });
              toast("デートを開始しました。良い時間を！");
            }}
          >
            <Play className="h-5 w-5" aria-hidden />
            このデートを開始
          </Button>
        </div>
      )}

      {inProgress && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-app border-t border-line bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted">
            <Repeat2 className="h-4 w-4 text-accent" aria-hidden />
            各Stopを回ったら「完了」を押してください
          </p>
        </div>
      )}
    </>
  );
}
