import type { DateScene } from "@/types";

export const SCENE_LABELS: Record<DateScene, string> = {
  "first-date": "初デート",
  anniversary: "記念日",
  casual: "カジュアル",
  night: "夜デート",
  lunch: "昼デート",
  luxury: "Luxury",
  budget: "低予算",
  rainy: "雨の日",
  outdoor: "アウトドア",
  travel: "旅行",
  surprise: "サプライズ",
  home: "おうちデート",
};

/** Discover category chips (scene filters). */
export const DISCOVER_SCENES: DateScene[] = [
  "first-date",
  "anniversary",
  "night",
  "lunch",
  "rainy",
  "budget",
  "luxury",
  "outdoor",
  "travel",
  "casual",
  "surprise",
  "home",
];

export const AREAS: string[] = [
  "渋谷",
  "恵比寿",
  "銀座",
  "六本木",
  "表参道",
  "新宿",
  "横浜",
  "鎌倉",
  "上野",
];

export interface BudgetBucket {
  label: string;
  min: number;
  max: number;
}

/** Per-person budget filter buckets. */
export const BUDGET_BUCKETS: BudgetBucket[] = [
  { label: "〜¥3,000", min: 0, max: 3000 },
  { label: "¥3,000〜¥5,000", min: 3000, max: 5000 },
  { label: "¥5,000〜¥10,000", min: 5000, max: 10000 },
  { label: "¥10,000〜¥20,000", min: 10000, max: 20000 },
  { label: "¥20,000〜", min: 20000, max: Number.POSITIVE_INFINITY },
];
