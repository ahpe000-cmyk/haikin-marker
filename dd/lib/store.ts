import type {
  DatePlan,
  DateReview,
  Reproduction,
  SavedDate,
} from "@/types";

// デモ用の状態。localStorage に永続化される。
// 純粋関数として実装し、React 層（hooks/useDemoStore）から利用する。

export interface DemoState {
  savedDates: SavedDate[];
  followedCreatorIds: string[];
  reproductions: Record<string, Reproduction>;
  myReviews: DateReview[];
  myPlans: DatePlan[];
}

export const INITIAL_STATE: DemoState = {
  savedDates: [],
  followedCreatorIds: [],
  reproductions: {},
  myReviews: [],
  myPlans: [],
};

export function isSaved(state: DemoState, planId: string): boolean {
  return state.savedDates.some((s) => s.planId === planId);
}

export function toggleSave(state: DemoState, planId: string): DemoState {
  return isSaved(state, planId)
    ? {
        ...state,
        savedDates: state.savedDates.filter((s) => s.planId !== planId),
      }
    : {
        ...state,
        savedDates: [
          { planId, savedAt: new Date().toISOString() },
          ...state.savedDates,
        ],
      };
}

export function isFollowing(state: DemoState, creatorId: string): boolean {
  return state.followedCreatorIds.includes(creatorId);
}

export function toggleFollow(state: DemoState, creatorId: string): DemoState {
  return isFollowing(state, creatorId)
    ? {
        ...state,
        followedCreatorIds: state.followedCreatorIds.filter(
          (id) => id !== creatorId,
        ),
      }
    : {
        ...state,
        followedCreatorIds: [...state.followedCreatorIds, creatorId],
      };
}

export function beginReproduction(state: DemoState, planId: string): DemoState {
  const existing = state.reproductions[planId];
  if (existing && existing.status !== "completed") return state;
  return {
    ...state,
    reproductions: {
      ...state.reproductions,
      [planId]: {
        planId,
        status: "planned",
        completedStopIds: [],
        reviewed: false,
      },
    },
  };
}

export function startReproduction(state: DemoState, planId: string): DemoState {
  const rep = state.reproductions[planId];
  if (!rep || rep.status !== "planned") return state;
  return {
    ...state,
    reproductions: {
      ...state.reproductions,
      [planId]: {
        ...rep,
        status: "in-progress",
        startedAt: new Date().toISOString(),
      },
    },
  };
}

export function toggleStopComplete(
  state: DemoState,
  planId: string,
  stopId: string,
): DemoState {
  const rep = state.reproductions[planId];
  if (!rep || rep.status !== "in-progress") return state;
  const done = rep.completedStopIds.includes(stopId);
  return {
    ...state,
    reproductions: {
      ...state.reproductions,
      [planId]: {
        ...rep,
        completedStopIds: done
          ? rep.completedStopIds.filter((id) => id !== stopId)
          : [...rep.completedStopIds, stopId],
      },
    },
  };
}

export function completeReproduction(
  state: DemoState,
  planId: string,
): DemoState {
  const rep = state.reproductions[planId];
  if (!rep || rep.status !== "in-progress") return state;
  return {
    ...state,
    reproductions: {
      ...state.reproductions,
      [planId]: {
        ...rep,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
    },
  };
}

export function addReview(state: DemoState, review: DateReview): DemoState {
  const rep = state.reproductions[review.planId];
  return {
    ...state,
    myReviews: [review, ...state.myReviews],
    reproductions: rep
      ? {
          ...state.reproductions,
          [review.planId]: { ...rep, reviewed: true },
        }
      : state.reproductions,
  };
}

export function addPlan(state: DemoState, plan: DatePlan): DemoState {
  return { ...state, myPlans: [plan, ...state.myPlans] };
}

export function reproduceProgress(
  rep: Reproduction | undefined,
  totalStops: number,
): { done: number; total: number; percent: number } {
  const done = rep ? rep.completedStopIds.length : 0;
  const percent = totalStops === 0 ? 0 : Math.round((done / totalStops) * 100);
  return { done, total: totalStops, percent };
}

// ユーザー操作を反映した「見かけ上の」統計値
export interface EffectiveStats {
  saveCount: number;
  reproduceCount: number;
  reviewCount: number;
  rating: number;
}

export function effectiveStats(state: DemoState, plan: DatePlan): EffectiveStats {
  const saved = isSaved(state, plan.id) ? 1 : 0;
  const rep = state.reproductions[plan.id];
  const reproduced = rep && rep.status === "completed" ? 1 : 0;
  const myReviews = state.myReviews.filter((r) => r.planId === plan.id);
  const reviewCount = plan.reviewCount + myReviews.length;
  let rating = plan.rating;
  if (myReviews.length > 0) {
    const sum =
      plan.rating * plan.reviewCount +
      myReviews.reduce((acc, r) => acc + r.overall, 0);
    rating = Math.round((sum / reviewCount) * 10) / 10;
  }
  return {
    saveCount: plan.saveCount + saved,
    reproduceCount: plan.reproduceCount + reproduced,
    reviewCount,
    rating,
  };
}

// ---- 永続化 ----

const STORAGE_KEY = "dd-demo-state-v1";

export function loadState(): DemoState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      savedDates: parsed.savedDates ?? [],
      followedCreatorIds: parsed.followedCreatorIds ?? [],
      reproductions: parsed.reproductions ?? {},
      myReviews: parsed.myReviews ?? [],
      myPlans: parsed.myPlans ?? [],
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage が使えない環境（プライベートモード等）では永続化を諦める
  }
}
