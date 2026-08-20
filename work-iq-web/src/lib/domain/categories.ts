import type { Category } from "./types";

export type EvergreenSlug = "business-terms" | "judgment" | "risk";

export const SLUG_TO_CATEGORY: Record<EvergreenSlug, Category> = {
  "business-terms": "business_terms",
  judgment: "judgment",
  risk: "risk",
};

export const CATEGORY_TO_SLUG: Record<string, EvergreenSlug> = {
  business_terms: "business-terms",
  judgment: "judgment",
  risk: "risk",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  business_terms: "ビジネス用語",
  judgment: "あなたならどうする？",
  risk: "リスク管理",
  current_affairs: "時事",
};

export function isEvergreenSlug(value: string): value is EvergreenSlug {
  return value in SLUG_TO_CATEGORY;
}
