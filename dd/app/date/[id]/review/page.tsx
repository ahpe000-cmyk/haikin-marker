"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { RatingInput } from "@/components/dd/Rating";
import { ErrorState } from "@/components/dd/States";
import { useToast } from "@/components/dd/Toast";
import { DEMO_USER } from "@/data/creators";
import { useDemoStore } from "@/hooks/useDemoStore";

// SCREEN 08: Post-Date Review
export default function PostDateReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { getPlan, addReview, hydrated } = useDemoStore();

  const [overall, setOverall] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [costPerformance, setCostPerformance] = useState(0);
  const [reproducibility, setReproducibility] = useState(0);
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const plan = getPlan(id);
  if (!plan) {
    return (
      <AppShell>
        <AppHeader showBack title="デートを評価" />
        {hydrated && <ErrorState title="このデートは見つかりません" />}
      </AppShell>
    );
  }

  const submit = () => {
    if (
      overall === 0 ||
      atmosphere === 0 ||
      costPerformance === 0 ||
      reproducibility === 0 ||
      wouldUseAgain === null
    ) {
      setError("すべての評価項目を選択してください。");
      return;
    }
    addReview({
      id: `my-${Date.now()}`,
      planId: plan.id,
      authorName: DEMO_USER.name,
      overall,
      atmosphere,
      costPerformance,
      reproducibility,
      wouldUseAgain,
      comment: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    });
    showToast("レビューを投稿しました");
    router.push(`/date/${plan.id}`);
  };

  return (
    <AppShell>
      <AppHeader showBack title="デートを評価" />
      <main className="space-y-5 px-4 py-5">
        <section>
          <p className="text-xs font-semibold text-[var(--dd-accent)]">
            POST-DATE REVIEW
          </p>
          <h1 className="mt-1 text-xl font-extrabold leading-snug">
            {plan.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--dd-gray)]">
            再現してみてどうでしたか？あなたの評価が次の誰かのデートになります。
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--dd-line)] bg-white p-4">
          <RatingInput label="総合満足度" value={overall} onChange={setOverall} />
          <RatingInput
            label="雰囲気"
            value={atmosphere}
            onChange={setAtmosphere}
          />
          <RatingInput
            label="コストパフォーマンス"
            value={costPerformance}
            onChange={setCostPerformance}
          />
          <RatingInput
            label="再現しやすさ"
            value={reproducibility}
            onChange={setReproducibility}
          />
        </section>

        <fieldset className="rounded-2xl border border-[var(--dd-line)] bg-white p-4">
          <legend className="px-1 text-sm font-bold">また使いたいですか？</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[
              { label: "はい", value: true },
              { label: "いいえ", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                aria-pressed={wouldUseAgain === opt.value}
                onClick={() => setWouldUseAgain(opt.value)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  wouldUseAgain === opt.value
                    ? "border-[var(--dd-ink)] bg-[var(--dd-ink)] text-white"
                    : "border-[var(--dd-line)] bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="review-comment"
            className="mb-2 block text-sm font-bold"
          >
            コメント（任意）
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="良かった点・注意点など、次に再現する人へのメッセージ"
            className="w-full rounded-2xl border border-[var(--dd-line)] bg-white p-3 text-sm outline-none focus:border-[var(--dd-ink)]"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          className="h-12 w-full rounded-xl bg-[var(--dd-accent)] text-base font-bold text-white transition-transform active:scale-[0.98]"
        >
          評価を投稿
        </button>
      </main>
    </AppShell>
  );
}
