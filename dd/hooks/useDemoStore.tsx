"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PLANS, PLAN_MAP } from "@/data/plans";
import {
  addPlan,
  addReview,
  beginReproduction,
  completeReproduction,
  effectiveStats,
  INITIAL_STATE,
  isFollowing,
  isSaved,
  loadState,
  saveState,
  startReproduction,
  toggleFollow,
  toggleSave,
  toggleStopComplete,
  type DemoState,
  type EffectiveStats,
} from "@/lib/store";
import type { DatePlan, DateReview } from "@/types";

interface DemoStoreValue {
  state: DemoState;
  hydrated: boolean;
  allPlans: DatePlan[];
  getPlan: (id: string) => DatePlan | undefined;
  statsOf: (plan: DatePlan) => EffectiveStats;
  isSaved: (planId: string) => boolean;
  isFollowing: (creatorId: string) => boolean;
  toggleSave: (planId: string) => void;
  toggleFollow: (creatorId: string) => void;
  beginReproduction: (planId: string) => void;
  startReproduction: (planId: string) => void;
  toggleStopComplete: (planId: string, stopId: string) => void;
  completeReproduction: (planId: string) => void;
  addReview: (review: DateReview) => void;
  addPlan: (plan: DatePlan) => void;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setState(loadState());
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydratedRef.current) saveState(state);
  }, [state]);

  const getPlan = useCallback(
    (id: string): DatePlan | undefined =>
      PLAN_MAP[id] ?? state.myPlans.find((p) => p.id === id),
    [state.myPlans],
  );

  const value = useMemo<DemoStoreValue>(
    () => ({
      state,
      hydrated,
      allPlans: [...PLANS, ...state.myPlans],
      getPlan,
      statsOf: (plan) => effectiveStats(state, plan),
      isSaved: (planId) => isSaved(state, planId),
      isFollowing: (creatorId) => isFollowing(state, creatorId),
      toggleSave: (planId) => setState((s) => toggleSave(s, planId)),
      toggleFollow: (creatorId) => setState((s) => toggleFollow(s, creatorId)),
      beginReproduction: (planId) =>
        setState((s) => beginReproduction(s, planId)),
      startReproduction: (planId) =>
        setState((s) => startReproduction(s, planId)),
      toggleStopComplete: (planId, stopId) =>
        setState((s) => toggleStopComplete(s, planId, stopId)),
      completeReproduction: (planId) =>
        setState((s) => completeReproduction(s, planId)),
      addReview: (review) => setState((s) => addReview(s, review)),
      addPlan: (plan) => setState((s) => addPlan(s, plan)),
    }),
    [state, hydrated, getPlan],
  );

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }
  return ctx;
}
