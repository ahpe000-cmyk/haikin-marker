"use client";

import { useSyncExternalStore } from "react";
import type { ProgressState } from "./local-progress";
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
} from "./progress-store";

/**
 * The shared progress state, or null during server render / hydration.
 */
export function useProgress(): ProgressState | null {
  return useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
}

const emptySubscribe = () => () => {};

/** False during SSR and the hydration render, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
