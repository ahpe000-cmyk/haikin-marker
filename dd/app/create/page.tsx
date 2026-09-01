"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { FilterChip } from "@/components/dd/FilterChip";
import { Tag } from "@/components/dd/Tag";
import { Timeline } from "@/components/dd/Timeline";
import { useToast } from "@/components/dd/Toast";
import {
  AREAS,
  CATEGORIES,
  CATEGORY_LABELS,
  STOP_CATEGORIES,
  STOP_CATEGORY_LABELS,
  TIME_LABELS,
  TIMES,
} from "@/data/meta";
import { formatDuration, formatYen } from "@/lib/format";
import { useDemoStore } from "@/hooks/useDemoStore";
import type {
  AreaId,
  DateCategory,
  DatePlan,
  DateStop,
  StopCategory,
  TimeOfDay,
} from "@/types";

interface StopDraft {
  key: number;
  time: string;
  name: string;
  category: StopCategory;
  durationMinutes: string;
  estimatedCost: string;
  description: string;
}

const emptyStop = (key: number): StopDraft => ({
  key,
  time: "",
  name: "",
  category: "cafe",
  durationMinutes: "60",
  estimatedCost: "1000",
  description: "",
});

const inputClass =
  "w-full rounded-xl border border-[var(--dd-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--dd-ink)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}

// SCREEN 07: Create Post（4ステップ）
export default function CreatePostPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { addPlan } = useDemoStore();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<AreaId>("shibuya");
  const [budgetMin, setBudgetMin] = useState("3000");
  const [budgetMax, setBudgetMax] = useState("5000");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");
  const [scenes, setScenes] = useState<DateCategory[]>([]);
  const [tagsText, setTagsText] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Timeline
  const [stops, setStops] = useState<StopDraft[]>([emptyStop(1)]);
  const [nextKey, setNextKey] = useState(2);

  // Step 3: Tips
  const [tips, setTips] = useState<string[]>(["", "", ""]);

  const parsedTags = tagsText
    .split(/[,、\s]+/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter((t) => t !== "");

  const totalDuration = stops.reduce(
    (acc, s) => acc + (parseInt(s.durationMinutes, 10) || 0),
    0,
  );
  const totalCost = stops.reduce(
    (acc, s) => acc + (parseInt(s.estimatedCost, 10) || 0),
    0,
  );

  const buildStops = (): DateStop[] =>
    stops.map((s, i) => ({
      id: `my-stop-${s.key}`,
      order: i + 1,
      time: s.time || "--:--",
      name: s.name,
      category: s.category,
      durationMinutes: parseInt(s.durationMinutes, 10) || 0,
      estimatedCost: parseInt(s.estimatedCost, 10) || 0,
      description: s.description,
      imageSeed: `my-post-${s.key}`,
    }));

  const goNext = () => {
    setError("");
    if (step === 1) {
      if (title.trim() === "") {
        setError("タイトルを入力してください。");
        return;
      }
      if (description.trim() === "") {
        setError("デートの紹介文を入力してください。");
        return;
      }
      const min = parseInt(budgetMin, 10);
      const max = parseInt(budgetMax, 10);
      if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) {
        setError("予算は「下限 ≤ 上限」になるように入力してください。");
        return;
      }
    }
    if (step === 2) {
      const valid = stops.filter((s) => s.name.trim() !== "");
      if (valid.length === 0) {
        setError("スポットを1つ以上追加してください（場所名は必須）。");
        return;
      }
      setStops(valid);
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = () => {
    const plan: DatePlan = {
      id: `my-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      coverImageSeed: `my-post-cover-${Date.now()}`,
      creatorId: "me",
      area,
      budgetMin: parseInt(budgetMin, 10) || 0,
      budgetMax: parseInt(budgetMax, 10) || 0,
      durationMinutes: totalDuration,
      timeOfDay,
      categories: scenes,
      tags: parsedTags,
      rating: 0,
      reviewCount: 0,
      saveCount: 0,
      reproduceCount: 0,
      creatorComment: "",
      tips: tips.map((t) => t.trim()).filter((t) => t !== ""),
      stops: buildStops(),
      createdAt: new Date().toISOString().slice(0, 10),
      isUserPost: true,
    };
    addPlan(plan);
    showToast("デートを投稿しました");
    router.push("/me");
  };

  const updateStop = (key: number, patch: Partial<StopDraft>) => {
    setStops((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    );
  };

  return (
    <AppShell>
      <AppHeader title="デートを投稿" />
      <main className="space-y-5 px-4 py-5">
        <div aria-label={`ステップ ${step} / 4`} className="flex gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              aria-hidden
              className={`h-1.5 flex-1 rounded-full ${
                n <= step ? "bg-[var(--dd-accent)]" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <section className="space-y-4">
            <h1 className="text-lg font-bold">1. 基本情報</h1>
            <Field label="タイトル" htmlFor="cp-title">
              <input
                id="cp-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：中目黒・桜の季節の夜さんぽデート"
                className={inputClass}
              />
            </Field>
            <Field label="エリア" htmlFor="cp-area">
              <select
                id="cp-area"
                value={area}
                onChange={(e) => setArea(e.target.value as AreaId)}
                className={inputClass}
              >
                {AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="予算下限（円/人）" htmlFor="cp-bmin">
                <input
                  id="cp-bmin"
                  type="number"
                  min={0}
                  step={500}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="予算上限（円/人）" htmlFor="cp-bmax">
                <input
                  id="cp-bmax"
                  type="number"
                  min={0}
                  step={500}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="時間帯" htmlFor="cp-time">
              <select
                id="cp-time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className={inputClass}
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {TIME_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-sm font-bold">シーン</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <FilterChip
                    key={c}
                    label={CATEGORY_LABELS[c]}
                    selected={scenes.includes(c)}
                    onToggle={() =>
                      setScenes((prev) =>
                        prev.includes(c)
                          ? prev.filter((x) => x !== c)
                          : [...prev, c],
                      )
                    }
                  />
                ))}
              </div>
            </fieldset>
            <Field label="タグ（カンマ・スペース区切り）" htmlFor="cp-tags">
              <input
                id="cp-tags"
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="例：夜さんぽ, 桜, 写真"
                className={inputClass}
              />
            </Field>
            <Field label="デートの紹介文" htmlFor="cp-desc">
              <textarea
                id="cp-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="どんな2人に、どんな理由でおすすめのデートですか？"
                className={inputClass}
              />
            </Field>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h1 className="text-lg font-bold">2. タイムライン</h1>
            <p className="text-sm text-[var(--dd-gray)]">
              現在の合計：{formatDuration(totalDuration)} /{" "}
              {formatYen(totalCost)}（1人）
            </p>
            {stops.map((s, i) => (
              <div
                key={s.key}
                className="space-y-3 rounded-2xl border border-[var(--dd-line)] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Stop {i + 1}</p>
                  {stops.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Stop ${i + 1} を削除`}
                      onClick={() =>
                        setStops((prev) =>
                          prev.filter((x) => x.key !== s.key),
                        )
                      }
                      className="rounded-full p-1.5 text-[var(--dd-gray)] hover:bg-neutral-100"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="時刻" htmlFor={`st-time-${s.key}`}>
                    <input
                      id={`st-time-${s.key}`}
                      type="time"
                      value={s.time}
                      onChange={(e) =>
                        updateStop(s.key, { time: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="カテゴリー" htmlFor={`st-cat-${s.key}`}>
                    <select
                      id={`st-cat-${s.key}`}
                      value={s.category}
                      onChange={(e) =>
                        updateStop(s.key, {
                          category: e.target.value as StopCategory,
                        })
                      }
                      className={inputClass}
                    >
                      {STOP_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {STOP_CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="場所名" htmlFor={`st-name-${s.key}`}>
                  <input
                    id={`st-name-${s.key}`}
                    type="text"
                    value={s.name}
                    onChange={(e) => updateStop(s.key, { name: e.target.value })}
                    placeholder="例：目黒川沿いのカフェ"
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="滞在時間（分）" htmlFor={`st-dur-${s.key}`}>
                    <input
                      id={`st-dur-${s.key}`}
                      type="number"
                      min={0}
                      step={5}
                      value={s.durationMinutes}
                      onChange={(e) =>
                        updateStop(s.key, { durationMinutes: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="予算（円/人）" htmlFor={`st-cost-${s.key}`}>
                    <input
                      id={`st-cost-${s.key}`}
                      type="number"
                      min={0}
                      step={100}
                      value={s.estimatedCost}
                      onChange={(e) =>
                        updateStop(s.key, { estimatedCost: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="コメント" htmlFor={`st-desc-${s.key}`}>
                  <textarea
                    id={`st-desc-${s.key}`}
                    rows={2}
                    value={s.description}
                    onChange={(e) =>
                      updateStop(s.key, { description: e.target.value })
                    }
                    placeholder="このスポットでのおすすめの過ごし方"
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setStops((prev) => [...prev, emptyStop(nextKey)]);
                setNextKey((k) => k + 1);
              }}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-semibold text-[var(--dd-charcoal)]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              スポットを追加
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h1 className="text-lg font-bold">3. 成功のポイント</h1>
            <p className="text-sm text-[var(--dd-gray)]">
              このデートを再現する人へのアドバイスを書きましょう（任意）。
            </p>
            {tips.map((tip, i) => (
              <Field key={i} label={`ポイント ${i + 1}`} htmlFor={`tip-${i}`}>
                <input
                  id={`tip-${i}`}
                  type="text"
                  value={tip}
                  onChange={(e) =>
                    setTips((prev) =>
                      prev.map((t, j) => (j === i ? e.target.value : t)),
                    )
                  }
                  placeholder="例：カフェは事前予約がおすすめ"
                  className={inputClass}
                />
              </Field>
            ))}
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <h1 className="text-lg font-bold">4. プレビュー</h1>
            <div className="rounded-2xl border border-[var(--dd-line)] bg-white p-4">
              <h2 className="text-xl font-extrabold leading-snug">{title}</h2>
              <p className="mt-1 text-sm text-[var(--dd-gray)]">
                {AREAS.find((a) => a.id === area)?.label} ・{" "}
                {formatYen(parseInt(budgetMin, 10) || 0)}〜
                {formatYen(parseInt(budgetMax, 10) || 0)} / 1人 ・{" "}
                {formatDuration(totalDuration)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scenes.map((s) => (
                  <Tag key={s} label={CATEGORY_LABELS[s]} />
                ))}
                {parsedTags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--dd-charcoal)]">
                {description}
              </p>
              <div className="mt-4">
                <Timeline stops={buildStops()} />
              </div>
            </div>
          </section>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => {
              setError("");
              setStep((s) => Math.max(1, s - 1));
            }}
            className="h-12 rounded-xl border border-[var(--dd-line)] bg-white text-sm font-semibold disabled:opacity-40"
          >
            戻る
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="h-12 rounded-xl bg-[var(--dd-ink)] text-sm font-bold text-white"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="h-12 rounded-xl bg-[var(--dd-accent)] text-sm font-bold text-white"
            >
              投稿する
            </button>
          )}
        </div>
      </main>
    </AppShell>
  );
}
