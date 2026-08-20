import type { Category, ChoiceId, QuizSession } from "@/lib/domain/types";

export type EvergreenCategory = "business_terms" | "judgment" | "risk";

export interface StoredAnswerRecord {
  questionId: string;
  category: Category;
  isCorrect: boolean;
  weight: number;
  dateKey: string;
}

export interface ReviewItem {
  questionId: string;
  category: Category;
  /** Index into the 1 → 3 → 7 → 30 day interval sequence. */
  intervalIndex: number;
  dueDateKey: string;
  addedDateKey: string;
}

export interface StreakState {
  current: number;
  lastDateKey: string | null;
}

export interface ProgressState {
  version: 1;
  anonId: string;
  /** Highest unlocked STEP per evergreen category (1–5). */
  stepUnlocks: Record<EvergreenCategory, number>;
  sessions: QuizSession[];
  answerHistory: StoredAnswerRecord[];
  streak: StreakState;
  reviewQueue: ReviewItem[];
  recentQuestions: { id: string; dateKey: string }[];
  pollVotes: Record<string, ChoiceId>;
}

const STORAGE_KEY = "work-iq-progress-v1";

/** Bounds so localStorage cannot grow indefinitely. */
export const MAX_SESSIONS = 60;
export const MAX_ANSWERS_PER_CATEGORY = 100;
export const MAX_RECENT_QUESTIONS = 200;
export const MAX_REVIEW_ITEMS = 200;

function generateAnonId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialProgress(): ProgressState {
  return {
    version: 1,
    anonId: generateAnonId(),
    stepUnlocks: { business_terms: 1, judgment: 1, risk: 1 },
    sessions: [],
    answerHistory: [],
    streak: { current: 0, lastDateKey: null },
    reviewQueue: [],
    recentQuestions: [],
    pollVotes: {},
  };
}

function isValidProgress(value: unknown): value is ProgressState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ProgressState>;
  return (
    candidate.version === 1 &&
    typeof candidate.anonId === "string" &&
    candidate.anonId.length > 0 &&
    typeof candidate.stepUnlocks === "object" &&
    candidate.stepUnlocks !== null &&
    Array.isArray(candidate.sessions) &&
    Array.isArray(candidate.answerHistory) &&
    Array.isArray(candidate.reviewQueue) &&
    Array.isArray(candidate.recentQuestions) &&
    typeof candidate.streak === "object" &&
    candidate.streak !== null &&
    typeof candidate.pollVotes === "object" &&
    candidate.pollVotes !== null
  );
}

/** Loads progress, falling back safely to a fresh state on corruption. */
export function loadProgress(): ProgressState {
  if (typeof window === "undefined") {
    return createInitialProgress();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProgress(parsed)) return createInitialProgress();
    return parsed;
  } catch {
    return createInitialProgress();
  }
}

/** Applies storage bounds to a progress state before persisting. */
export function boundProgress(state: ProgressState): ProgressState {
  const answersByCategory = new Map<Category, StoredAnswerRecord[]>();
  for (const record of state.answerHistory) {
    const list = answersByCategory.get(record.category) ?? [];
    list.push(record);
    answersByCategory.set(record.category, list);
  }
  const boundedAnswers: StoredAnswerRecord[] = [];
  for (const list of answersByCategory.values()) {
    boundedAnswers.push(...list.slice(-MAX_ANSWERS_PER_CATEGORY));
  }
  return {
    ...state,
    sessions: state.sessions.slice(-MAX_SESSIONS),
    answerHistory: boundedAnswers,
    reviewQueue: state.reviewQueue.slice(-MAX_REVIEW_ITEMS),
    recentQuestions: state.recentQuestions.slice(-MAX_RECENT_QUESTIONS),
  };
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boundProgress(state)));
  } catch {
    // Storage may be full or unavailable (private mode); the app keeps working
    // with in-memory state for the current visit.
  }
}

/** Returns the stored anonymous ID, creating and persisting one if needed. */
export function getOrCreateAnonId(): string {
  const progress = loadProgress();
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) saveProgress(progress);
  }
  return progress.anonId;
}
