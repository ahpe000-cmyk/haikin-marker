"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Footprints } from "lucide-react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { ConfirmDialog } from "@/components/dd/ConfirmDialog";
import { ErrorState, LoadingState } from "@/components/dd/States";
import { useToast } from "@/components/dd/Toast";
import { STOP_CATEGORY_LABELS } from "@/data/meta";
import { formatDuration, formatYen } from "@/lib/format";
import { reproduceProgress } from "@/lib/store";
import { useDemoStore } from "@/hooks/useDemoStore";

// SCREEN 06: Reproduce Date
export default function ReproduceDatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getPlan,
    state,
    hydrated,
    beginReproduction,
    startReproduction,
    toggleStopComplete,
    completeReproduction,
  } = useDemoStore();
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);

  const plan = getPlan(id);
  const rep = state.reproductions[id];

  // 詳細画面を経由せず直接開いた場合も再現プランを用意する
  useEffect(() => {
    if (hydrated && plan && !rep) beginReproduction(plan.id);
  }, [hydrated, plan, rep, beginReproduction]);

  if (!plan) {
    return (
      <AppShell>
        <AppHeader showBack title="デートを再現" />
        {hydrated && <ErrorState title="このデートは見つかりません" />}
      </AppShell>
    );
  }

  if (!rep) {
    return (
      <AppShell>
        <AppHeader showBack title="デートを再現" />
        <LoadingState label="再現プランを準備中…" />
      </AppShell>
    );
  }

  const stops = [...plan.stops].sort((a, b) => a.order - b.order);
  const progress = reproduceProgress(rep, stops.length);
  const totalCost = stops.reduce((acc, s) => acc + s.estimatedCost, 0);
  const inProgress = rep.status === "in-progress";
  const completed = rep.status === "completed";

  const finish = () => {
    completeReproduction(plan.id);
    showToast("デートを完了しました！おつかれさまでした");
    router.push(`/date/${plan.id}/review`);
  };

  return (
    <AppShell>
      <AppHeader showBack title="このデートを使う" />
      <main className="space-y-5 px-4 py-5 pb-28">
        <section>
          <p className="text-xs font-semibold text-[var(--dd-accent)]">
            REPRODUCE
          </p>
          <h1 className="mt-1 text-xl font-extrabold leading-snug">
            {plan.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--dd-gray)]">
            タイムラインに沿って進めて、各スポットを完了にしていきましょう。
          </p>
        </section>

        <section
          aria-label="進行状況"
          className="rounded-2xl border border-[var(--dd-line)] bg-white p-4"
        >
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-bold">進行状況</p>
            <p className="text-sm font-bold">
              {progress.done} / {progress.total} Stops
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress.done}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100"
          >
            <div
              className="h-full rounded-full bg-[var(--dd-accent)] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--dd-gray)]">
            推定総額（1人あたり）：
            <span className="font-bold text-[var(--dd-ink)]">
              {formatYen(totalCost)}
            </span>
          </p>
        </section>

        <section aria-label="チェックリスト">
          <ol className="space-y-3">
            {stops.map((stop, i) => {
              const done = rep.completedStopIds.includes(stop.id);
              return (
                <li key={stop.id}>
                  <div
                    className={`rounded-2xl border p-4 transition-colors ${
                      done
                        ? "border-[var(--dd-accent)] bg-[var(--dd-accent-soft)]"
                        : "border-[var(--dd-line)] bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={done}
                        aria-label={`${stop.name} を完了にする`}
                        disabled={!inProgress}
                        onClick={() => toggleStopComplete(plan.id, stop.id)}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          done
                            ? "border-[var(--dd-accent)] bg-[var(--dd-accent)] text-white"
                            : "border-neutral-300 bg-white"
                        } ${!inProgress ? "opacity-50" : ""}`}
                      >
                        {done && <Check className="h-4 w-4" aria-hidden />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[var(--dd-accent)]">
                          {stop.time}
                        </p>
                        <p
                          className={`font-bold leading-snug ${
                            done ? "line-through opacity-70" : ""
                          }`}
                        >
                          {stop.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--dd-gray)]">
                          {STOP_CATEGORY_LABELS[stop.category]} ・ 滞在
                          {formatDuration(stop.durationMinutes)} ・{" "}
                          {stop.estimatedCost === 0
                            ? "¥0"
                            : `${formatYen(stop.estimatedCost)}/人`}
                        </p>
                        <p className="mt-1 text-sm text-[var(--dd-charcoal)]">
                          {stop.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  {i < stops.length - 1 && (
                    <p className="my-1 flex items-center gap-1 pl-4 text-xs text-[var(--dd-gray)]">
                      <Footprints className="h-3.5 w-3.5" aria-hidden />
                      次のスポットへ移動
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {completed && (
          <section className="rounded-2xl bg-[var(--dd-accent-soft)] p-4 text-sm">
            このデートは完了済みです。
            {!rep.reviewed && "感想をレビューで残しましょう。"}
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-[calc(3.4rem+env(safe-area-inset-bottom))] z-40 border-t border-[var(--dd-line)] bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto w-full max-w-md lg:max-w-2xl">
          {rep.status === "planned" && (
            <button
              type="button"
              onClick={() => {
                startReproduction(plan.id);
                showToast("デートを開始しました。楽しんで！");
              }}
              className="h-12 w-full rounded-xl bg-[var(--dd-accent)] text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              デートを開始
            </button>
          )}
          {inProgress && (
            <button
              type="button"
              onClick={() => {
                if (progress.done < progress.total) {
                  setConfirmIncomplete(true);
                } else {
                  finish();
                }
              }}
              className="h-12 w-full rounded-xl bg-[var(--dd-ink)] text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              デートを完了
            </button>
          )}
          {completed && (
            <button
              type="button"
              onClick={() => router.push(`/date/${plan.id}/review`)}
              className="h-12 w-full rounded-xl bg-[var(--dd-accent)] text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              {rep.reviewed ? "レビューを見る・追加する" : "レビューを書く"}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmIncomplete}
        title="まだ完了していないスポットがあります"
        description="このままデートを完了しますか？"
        confirmLabel="完了する"
        onConfirm={() => {
          setConfirmIncomplete(false);
          finish();
        }}
        onCancel={() => setConfirmIncomplete(false)}
      />
    </AppShell>
  );
}
