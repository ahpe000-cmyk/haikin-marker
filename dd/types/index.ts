// DD (Date × Decoration) demo — domain types
// All data in this demo is fictitious ("DEMO DATA").

export type AreaId =
  | "shibuya"
  | "ebisu"
  | "shinjuku"
  | "ginza"
  | "roppongi"
  | "omotesando";

export interface Area {
  id: AreaId;
  label: string;
}

export type DateCategory =
  | "first-date"
  | "anniversary"
  | "rainy-day"
  | "night"
  | "daytime"
  | "low-budget"
  | "luxury"
  | "active";

export type TimeOfDay = "lunch" | "afternoon" | "evening" | "night";

export type StopCategory =
  | "cafe"
  | "restaurant"
  | "bar"
  | "view"
  | "walk"
  | "museum"
  | "activity"
  | "shopping"
  | "cinema"
  | "park";

export interface User {
  id: string;
  name: string;
  bio: string;
  avatarSeed: string;
  followers: number;
  following: number;
}

export interface CreatorProfile extends User {
  totalDates: number;
  totalReproductions: number;
  averageRating: number;
}

export interface DateStop {
  id: string;
  order: number;
  time: string; // "18:30"
  name: string;
  category: StopCategory;
  durationMinutes: number;
  estimatedCost: number; // per person, JPY
  description: string;
  imageSeed: string;
}

export interface DatePlan {
  id: string;
  title: string;
  description: string;
  coverImageSeed: string;
  creatorId: string;
  area: AreaId;
  budgetMin: number;
  budgetMax: number;
  durationMinutes: number;
  timeOfDay: TimeOfDay;
  categories: DateCategory[];
  tags: string[];
  rating: number; // 0-5
  reviewCount: number;
  saveCount: number;
  reproduceCount: number;
  creatorComment: string;
  tips: string[];
  stops: DateStop[];
  createdAt: string; // ISO date
  isUserPost?: boolean;
}

export interface DateReview {
  id: string;
  planId: string;
  authorName: string;
  overall: number; // 1-5
  atmosphere: number;
  costPerformance: number;
  reproducibility: number;
  wouldUseAgain: boolean;
  comment: string;
  createdAt: string;
}

export interface SavedDate {
  planId: string;
  savedAt: string;
}

export type ReproductionStatus = "planned" | "in-progress" | "completed";

export interface Reproduction {
  planId: string;
  status: ReproductionStatus;
  completedStopIds: string[];
  startedAt?: string;
  completedAt?: string;
  reviewed: boolean;
}

export interface RankingEntry {
  plan: DatePlan;
  score: number;
  rank: number;
}

export type RankingTab = "overall" | "save" | "reproduce" | "rating";

export interface SearchFilters {
  keyword: string;
  areas: AreaId[];
  budgets: BudgetRangeId[];
  times: TimeOfDay[];
  scenes: DateCategory[];
  durations: DurationRangeId[];
}

export type BudgetRangeId = "b1" | "b2" | "b3" | "b4" | "b5";
export type DurationRangeId = "short" | "medium" | "long";
