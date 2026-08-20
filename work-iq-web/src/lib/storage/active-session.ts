import type { QuizSession } from "@/lib/domain/types";

const ACTIVE_SESSION_KEY = "work-iq-active-session-v1";

/**
 * The in-flight quiz session is persisted after every answer so a refresh
 * never silently loses completed answers.
 */
export function loadActiveSession(): QuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizSession;
    if (!parsed || typeof parsed.id !== "string" || !Array.isArray(parsed.answers)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: QuizSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore quota errors; the in-memory session continues to work.
  }
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // Ignore.
  }
}
