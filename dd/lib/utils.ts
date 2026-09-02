import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "9200" -> "¥9,200" */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** "¥9,000〜¥12,000" style budget range. */
export function formatBudget(min: number, max: number): string {
  if (min === max) return formatYen(min);
  return `${formatYen(min)}〜${formatYen(max)}`;
}

/** 250 -> "4h 10m" / 50 -> "50m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** 12800 -> "1.2万" / 980 -> "980" */
export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}万`;
  if (n >= 1000) return n.toLocaleString("ja-JP");
  return String(n);
}

/** Relative time in Japanese, against `now` (defaults to Date.now()). */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}週間前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}ヶ月前`;
  return `${Math.floor(days / 365)}年前`;
}

/** Deterministic picsum photo URL for demo imagery. */
export function photo(seed: string, w = 800, h = 1000): string {
  return `https://picsum.photos/seed/dd-${seed}/${w}/${h}`;
}

export function avatarPhoto(seed: string): string {
  return photo(`av-${seed}`, 240, 240);
}

let idCounter = 0;
/** Unique-enough id for demo-created entities. */
export function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
