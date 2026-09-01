import type {
  Area,
  AreaId,
  BudgetRangeId,
  DateCategory,
  DurationRangeId,
  StopCategory,
  TimeOfDay,
} from "@/types";

export const AREAS: Area[] = [
  { id: "shibuya", label: "渋谷" },
  { id: "ebisu", label: "恵比寿" },
  { id: "shinjuku", label: "新宿" },
  { id: "ginza", label: "銀座" },
  { id: "roppongi", label: "六本木" },
  { id: "omotesando", label: "表参道" },
];

export const AREA_LABELS: Record<AreaId, string> = Object.fromEntries(
  AREAS.map((a) => [a.id, a.label]),
) as Record<AreaId, string>;

export const CATEGORY_LABELS: Record<DateCategory, string> = {
  "first-date": "初デート",
  anniversary: "記念日",
  "rainy-day": "雨の日",
  night: "夜デート",
  daytime: "昼デート",
  "low-budget": "低予算",
  luxury: "大人デート",
  active: "アクティブ",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as DateCategory[];

export const TIME_LABELS: Record<TimeOfDay, string> = {
  lunch: "ランチ",
  afternoon: "午後",
  evening: "夕方",
  night: "夜",
};

export const TIMES = Object.keys(TIME_LABELS) as TimeOfDay[];

export const STOP_CATEGORY_LABELS: Record<StopCategory, string> = {
  cafe: "カフェ",
  restaurant: "レストラン",
  bar: "バー",
  view: "夜景・展望",
  walk: "散歩",
  museum: "美術館",
  activity: "アクティビティ",
  shopping: "ショッピング",
  cinema: "映画",
  park: "公園",
};

export const STOP_CATEGORIES = Object.keys(
  STOP_CATEGORY_LABELS,
) as StopCategory[];

export interface BudgetRange {
  id: BudgetRangeId;
  label: string;
  min: number;
  max: number | null;
}

export const BUDGET_RANGES: BudgetRange[] = [
  { id: "b1", label: "〜¥3,000", min: 0, max: 3000 },
  { id: "b2", label: "¥3,000〜¥5,000", min: 3000, max: 5000 },
  { id: "b3", label: "¥5,000〜¥10,000", min: 5000, max: 10000 },
  { id: "b4", label: "¥10,000〜¥20,000", min: 10000, max: 20000 },
  { id: "b5", label: "¥20,000〜", min: 20000, max: null },
];

export interface DurationRange {
  id: DurationRangeId;
  label: string;
  minMinutes: number;
  maxMinutes: number | null;
}

export const DURATION_RANGES: DurationRange[] = [
  { id: "short", label: "〜2時間", minMinutes: 0, maxMinutes: 120 },
  { id: "medium", label: "2〜4時間", minMinutes: 120, maxMinutes: 240 },
  { id: "long", label: "4時間〜", minMinutes: 240, maxMinutes: null },
];
