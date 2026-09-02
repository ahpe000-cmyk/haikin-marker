"use client";

import { Check, Star } from "lucide-react";
import type { DateScene, DateExperience } from "@/types";
import { SCENE_LABELS, AREAS, DISCOVER_SCENES } from "@/lib/labels";
import { SmartImage } from "@/components/shared/smart-image";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, photo } from "@/lib/utils";

/** Candidate demo photos the user can "upload" from. */
export const CANDIDATE_PHOTOS = Array.from({ length: 9 }, (_, i) =>
  photo(`upload-${i + 1}`)
);

// --- STEP 1: Media ---------------------------------------------------------
export function MediaStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (url: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">写真を選ぶ</h2>
      <p className="mt-1 text-sm text-muted">
        1〜10枚選択できます（デモのためサンプル写真から選びます）
      </p>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {CANDIDATE_PHOTOS.map((url, i) => {
          const idx = selected.indexOf(url);
          const isSelected = idx >= 0;
          return (
            <button
              key={url}
              type="button"
              aria-pressed={isSelected}
              aria-label={`サンプル写真${i + 1}を${isSelected ? "解除" : "選択"}`}
              onClick={() => onToggle(url)}
              className={cn(
                "relative overflow-hidden rounded-lg",
                isSelected && "ring-2 ring-accent ring-offset-2"
              )}
            >
              <SmartImage src={url} alt={`サンプル写真 ${i + 1}`} aspect="1/1" />
              {isSelected && (
                <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {idx + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- STEP 2: Caption -------------------------------------------------------
export function CaptionStep({
  caption,
  location,
  onCaption,
  onLocation,
}: {
  caption: string;
  location: string;
  onCaption: (v: string) => void;
  onLocation: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">キャプション</h2>
        <p className="mt-1 text-sm text-muted">今日のデートはどんな時間でしたか？</p>
      </div>
      <div>
        <label htmlFor="create-caption" className="mb-1.5 block text-sm font-medium">
          キャプション
        </label>
        <Textarea
          id="create-caption"
          rows={5}
          maxLength={500}
          value={caption}
          onChange={(e) => onCaption(e.target.value)}
          placeholder="例：付き合って1周年。銀座で少し背伸びした夜。"
        />
      </div>
      <div>
        <label htmlFor="create-location" className="mb-1.5 block text-sm font-medium">
          場所（任意）
        </label>
        <Input
          id="create-location"
          value={location}
          onChange={(e) => onLocation(e.target.value)}
          placeholder="例：銀座"
          maxLength={30}
        />
      </div>
    </div>
  );
}

// --- STEP 3: Add date info? ------------------------------------------------
export function AskDateStep({
  onYes,
  onSkip,
}: {
  onYes: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col items-center pt-8 text-center">
      <h2 className="text-lg font-bold">デート情報を追加しますか？</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        エリア・予算・タイムラインを追加すると、他のユーザーがこのデートを保存・再現できるようになります。あとから追加もできます。
      </p>
      <div className="mt-8 w-full space-y-3">
        <Button size="lg" className="w-full" onClick={onYes}>
          デート情報を追加
        </Button>
        <Button variant="ghost" className="w-full text-muted" onClick={onSkip}>
          今回はスキップ
        </Button>
      </div>
    </div>
  );
}

// --- STEP 4: Date data -----------------------------------------------------
export interface DraftStop {
  time: string;
  placeName: string;
  category: string;
  estimatedCost: number;
}

export interface DraftDate {
  title: string;
  area: string;
  scene: DateScene;
  budgetMin: number;
  budgetMax: number;
  durationMinutes: number;
  stops: DraftStop[];
  tips: string;
}

export function DateDataStep({
  draft,
  onChange,
}: {
  draft: DraftDate;
  onChange: (d: DraftDate) => void;
}) {
  const updateStop = (i: number, patch: Partial<DraftStop>) => {
    const stops = draft.stops.map((s, j) => (j === i ? { ...s, ...patch } : s));
    onChange({ ...draft, stops });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">デート情報</h2>
      <div>
        <label htmlFor="dd-title" className="mb-1.5 block text-sm font-medium">
          タイトル
        </label>
        <Input
          id="dd-title"
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="例：銀座で少し背伸びする1周年デート"
          maxLength={40}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dd-area" className="mb-1.5 block text-sm font-medium">
            エリア
          </label>
          <select
            id="dd-area"
            value={draft.area}
            onChange={(e) => onChange({ ...draft, area: e.target.value })}
            className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dd-scene" className="mb-1.5 block text-sm font-medium">
            シーン
          </label>
          <select
            id="dd-scene"
            value={draft.scene}
            onChange={(e) => onChange({ ...draft, scene: e.target.value as DateScene })}
            className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm"
          >
            {DISCOVER_SCENES.map((s) => (
              <option key={s} value={s}>
                {SCENE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dd-bmin" className="mb-1.5 block text-sm font-medium">
            予算（下限 / 1人）
          </label>
          <Input
            id="dd-bmin"
            type="number"
            min={0}
            step={500}
            value={draft.budgetMin}
            onChange={(e) => onChange({ ...draft, budgetMin: Number(e.target.value) })}
          />
        </div>
        <div>
          <label htmlFor="dd-bmax" className="mb-1.5 block text-sm font-medium">
            予算（上限 / 1人）
          </label>
          <Input
            id="dd-bmax"
            type="number"
            min={0}
            step={500}
            value={draft.budgetMax}
            onChange={(e) => onChange({ ...draft, budgetMax: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">タイムライン（任意）</p>
        <div className="space-y-3">
          {draft.stops.map((stop, i) => (
            <div key={i} className="rounded-xl border border-line bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted">Stop {i + 1}</p>
                <button
                  type="button"
                  className="min-h-8 text-xs text-red-600"
                  onClick={() =>
                    onChange({ ...draft, stops: draft.stops.filter((_, j) => j !== i) })
                  }
                >
                  削除
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-muted" htmlFor={`stop-time-${i}`}>
                    時刻
                  </label>
                  <Input
                    id={`stop-time-${i}`}
                    value={stop.time}
                    onChange={(e) => updateStop(i, { time: e.target.value })}
                    placeholder="19:00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted" htmlFor={`stop-cat-${i}`}>
                    カテゴリ
                  </label>
                  <Input
                    id={`stop-cat-${i}`}
                    value={stop.category}
                    onChange={(e) => updateStop(i, { category: e.target.value })}
                    placeholder="ディナー"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="mb-1 block text-xs text-muted" htmlFor={`stop-place-${i}`}>
                  場所の名前
                </label>
                <Input
                  id={`stop-place-${i}`}
                  value={stop.placeName}
                  onChange={(e) => updateStop(i, { placeName: e.target.value })}
                  placeholder="例：GINZA BISTRO 燈"
                />
              </div>
              <div className="mt-2">
                <label className="mb-1 block text-xs text-muted" htmlFor={`stop-cost-${i}`}>
                  1人あたり費用（円）
                </label>
                <Input
                  id={`stop-cost-${i}`}
                  type="number"
                  min={0}
                  step={100}
                  value={stop.estimatedCost}
                  onChange={(e) => updateStop(i, { estimatedCost: Number(e.target.value) })}
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() =>
            onChange({
              ...draft,
              stops: [
                ...draft.stops,
                { time: "", placeName: "", category: "", estimatedCost: 0 },
              ],
            })
          }
        >
          + Stopを追加
        </Button>
      </div>

      <div>
        <label htmlFor="dd-tips" className="mb-1.5 block text-sm font-medium">
          Tips（任意・改行区切り）
        </label>
        <Textarea
          id="dd-tips"
          rows={3}
          value={draft.tips}
          onChange={(e) => onChange({ ...draft, tips: e.target.value })}
          placeholder="例：ディナーは2週間前までに予約"
        />
      </div>
    </div>
  );
}

// --- STEP 5: Reproduced someone's date? -----------------------------------
export function AskReproduceStep({
  candidates,
  onSelect,
  onNo,
}: {
  candidates: DateExperience[];
  onSelect: (dateId: string) => void;
  onNo: () => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">誰かのデートを再現しましたか？</h2>
      <p className="mt-1 text-sm text-muted">
        再現元を選ぶと、Original Creatorに実績が還元されます。
      </p>
      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
        {candidates.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-left text-sm hover:border-ink"
          >
            <span className="block font-semibold">{d.title}</span>
            <span className="text-xs text-muted">{d.area}</span>
          </button>
        ))}
      </div>
      <Button variant="ghost" className="mt-4 w-full text-muted" onClick={onNo}>
        いいえ、オリジナルのデートです
      </Button>
    </div>
  );
}

// --- Reproduction extras: changed stops + rating ---------------------------
export interface ChangedStopDraft {
  stopId: string;
  label: string;
  changed: boolean;
  note: string;
}

export function ReproductionDetailStep({
  originalTitle,
  changedStops,
  rating,
  onToggleStop,
  onNote,
  onRating,
}: {
  originalTitle: string;
  changedStops: ChangedStopDraft[];
  rating: number;
  onToggleStop: (stopId: string) => void;
  onNote: (stopId: string, note: string) => void;
  onRating: (r: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">再現の詳細</h2>
        <p className="mt-1 text-sm text-muted">
          Original：<span className="font-medium text-ink">{originalTitle}</span>
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">変更したStop</p>
        <div className="space-y-2">
          {changedStops.map((cs) => (
            <div key={cs.stopId} className="rounded-xl border border-line bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{cs.label}</span>
                <button
                  type="button"
                  aria-pressed={cs.changed}
                  onClick={() => onToggleStop(cs.stopId)}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3 text-xs font-medium",
                    cs.changed
                      ? "bg-accent text-white"
                      : "bg-ink/5 text-muted hover:text-ink"
                  )}
                >
                  {cs.changed ? "Changed" : "Same"}
                </button>
              </div>
              {cs.changed && (
                <Input
                  className="mt-2"
                  value={cs.note}
                  onChange={(e) => onNote(cs.stopId, e.target.value)}
                  placeholder="どう変更しましたか？（例：行きつけのバーに変更）"
                  maxLength={50}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">このデートの評価</p>
        <div className="flex gap-1" role="radiogroup" aria-label="評価">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={rating === r}
              aria-label={`${r}点`}
              onClick={() => onRating(r)}
              className="flex h-11 w-11 items-center justify-center"
            >
              <Star
                className={cn(
                  "h-8 w-8",
                  r <= rating ? "fill-amber-400 text-amber-400" : "text-line"
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- STEP 6: Preview -------------------------------------------------------
export function PreviewStep({
  media,
  caption,
  location,
  dateTitle,
  originalTitle,
}: {
  media: string[];
  caption: string;
  location: string;
  dateTitle?: string;
  originalTitle?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">プレビュー</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <SmartImage src={media[0] ?? ""} alt="投稿プレビュー" aspect="4/5" />
        <div className="space-y-2 p-4">
          {location && <p className="text-xs text-muted">{location}</p>}
          <p className="whitespace-pre-line text-sm leading-relaxed">{caption}</p>
          {originalTitle && (
            <p className="flex items-center gap-1.5 rounded-lg bg-accent-soft px-2.5 py-2 text-xs font-medium text-accent-dark">
              <Check className="h-3.5 w-3.5" aria-hidden />
              再現元：{originalTitle}
            </p>
          )}
          {dateTitle && !originalTitle && (
            <p className="flex items-center gap-1.5 rounded-lg bg-ink/5 px-2.5 py-2 text-xs font-medium">
              <Check className="h-3.5 w-3.5" aria-hidden />
              デート情報付き：{dateTitle}
            </p>
          )}
          {media.length > 1 && (
            <p className="text-xs text-muted">写真 {media.length}枚</p>
          )}
        </div>
      </div>
    </div>
  );
}
