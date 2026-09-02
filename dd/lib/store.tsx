"use client";

/**
 * App-wide demo state: React Context + reducer, persisted to localStorage.
 * The domain reducer itself is pure (lib/state.ts) so it can be unit-tested;
 * this file only adds hydration + persistence.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
  type Dispatch,
} from "react";
import { initialState, reducer, type DemoAction, type DemoState } from "./state";

const STORAGE_KEY = "dd-demo-state-v1";

type StoreAction = DemoAction | { type: "__HYDRATE__"; state: DemoState };

function storeReducer(state: DemoState, action: StoreAction): DemoState {
  if (action.type === "__HYDRATE__") return action.state;
  return reducer(state, action);
}

interface StoreValue {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  /** false until localStorage has been read (avoids hydration mismatch). */
  ready: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadPersisted(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return { ...initialState, ...parsed };
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) dispatch({ type: "__HYDRATE__", state: persisted });
    setReady(true);
  }, []);

  // Persist on change (after hydration)
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode etc.) — demo continues in memory
    }
  }, [state, ready]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppState(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
