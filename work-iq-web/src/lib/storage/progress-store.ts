import {
  boundProgress,
  loadProgress,
  saveProgress,
  type ProgressState,
} from "./local-progress";

/**
 * Client-side progress store: a cached snapshot over localStorage that
 * React components consume via useSyncExternalStore, so every screen sees
 * the same state and updates propagate without cascading effects.
 */
let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

export function getProgressSnapshot(): ProgressState | null {
  if (typeof window === "undefined") return null;
  if (cache === null) {
    cache = boundProgress(loadProgress());
  }
  return cache;
}

export function getServerProgressSnapshot(): ProgressState | null {
  return null;
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateProgress(
  updater: (state: ProgressState) => ProgressState,
): ProgressState {
  const current = getProgressSnapshot() ?? loadProgress();
  const next = boundProgress(updater(current));
  cache = next;
  saveProgress(next);
  for (const listener of listeners) listener();
  return next;
}

/** Test helper: drops the in-memory cache so the next read hits storage. */
export function resetProgressCacheForTests(): void {
  cache = null;
}
