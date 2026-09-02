/**
 * Demo app state — pure reducer (unit-testable, no React).
 * Persisted to localStorage by lib/store.tsx.
 */
import type { Comment, DateExperience, Post, Reproduction } from "@/types";

export interface ReproProgress {
  dateId: string;
  startedAt: string;
  completedStops: number[]; // stop orders
  finished: boolean;
  /** Set when a reproduction post has been created from this run. */
  postedReproductionId?: string;
}

export interface DemoState {
  onboarded: boolean;
  /** postId -> true(liked) / false(explicitly unliked a mock-liked post) */
  liked: Record<string, boolean>;
  savedPosts: Record<string, boolean>;
  savedDates: Record<string, boolean>;
  /** actorId -> follow override (true = following, false = unfollowed default) */
  following: Record<string, boolean>;
  /** postId -> comments the demo user added */
  userComments: Record<string, Comment[]>;
  createdPosts: Post[];
  createdDates: DateExperience[];
  createdReproductions: Reproduction[];
  reproProgress: Record<string, ReproProgress>;
  blockedActors: Record<string, boolean>;
  reportedPosts: Record<string, boolean>;
  notificationsRead: boolean;
  /** Demo-user profile edits (SCREEN 13 edit modal). */
  profileOverrides: { displayName?: string; bio?: string };
}

export const initialState: DemoState = {
  onboarded: false,
  liked: {},
  savedPosts: {},
  savedDates: {},
  following: {},
  userComments: {},
  createdPosts: [],
  createdDates: [],
  createdReproductions: [],
  reproProgress: {},
  blockedActors: {},
  reportedPosts: {},
  notificationsRead: false,
  profileOverrides: {},
};

/** Accounts the demo user follows before any interaction. */
export const DEFAULT_FOLLOWING: string[] = ["u2", "u10", "c5", "c6"];

export type DemoAction =
  | { type: "MARK_ONBOARDED" }
  | { type: "TOGGLE_LIKE"; postId: string; baseLiked: boolean }
  | { type: "TOGGLE_SAVE_POST"; postId: string }
  | { type: "TOGGLE_SAVE_DATE"; dateId: string }
  | { type: "TOGGLE_FOLLOW"; actorId: string; baseFollowing: boolean }
  | { type: "ADD_COMMENT"; comment: Comment }
  | {
      type: "CREATE_POST";
      post: Post;
      date?: DateExperience;
      reproduction?: Reproduction;
    }
  | { type: "START_REPRODUCTION"; dateId: string; startedAt: string }
  | { type: "COMPLETE_STOP"; dateId: string; stopOrder: number; totalStops: number }
  | { type: "RESET_REPRODUCTION"; dateId: string }
  | { type: "BLOCK_ACTOR"; actorId: string }
  | { type: "REPORT_POST"; postId: string }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "UPDATE_PROFILE"; displayName: string; bio: string }
  | { type: "RESET_ALL" };

export function isFollowing(state: DemoState, actorId: string): boolean {
  return state.following[actorId] ?? DEFAULT_FOLLOWING.includes(actorId);
}

export function isLiked(state: DemoState, postId: string, baseLiked = false): boolean {
  return state.liked[postId] ?? baseLiked;
}

export function isPostSaved(state: DemoState, postId: string): boolean {
  return state.savedPosts[postId] ?? false;
}

export function isDateSaved(state: DemoState, dateId: string): boolean {
  return state.savedDates[dateId] ?? false;
}

export function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "MARK_ONBOARDED":
      return { ...state, onboarded: true };

    case "TOGGLE_LIKE": {
      const current = state.liked[action.postId] ?? action.baseLiked;
      return {
        ...state,
        liked: { ...state.liked, [action.postId]: !current },
      };
    }

    case "TOGGLE_SAVE_POST": {
      const current = state.savedPosts[action.postId] ?? false;
      return {
        ...state,
        savedPosts: { ...state.savedPosts, [action.postId]: !current },
      };
    }

    case "TOGGLE_SAVE_DATE": {
      const current = state.savedDates[action.dateId] ?? false;
      return {
        ...state,
        savedDates: { ...state.savedDates, [action.dateId]: !current },
      };
    }

    case "TOGGLE_FOLLOW": {
      const current = state.following[action.actorId] ?? action.baseFollowing;
      return {
        ...state,
        following: { ...state.following, [action.actorId]: !current },
      };
    }

    case "ADD_COMMENT": {
      const existing = state.userComments[action.comment.postId] ?? [];
      return {
        ...state,
        userComments: {
          ...state.userComments,
          [action.comment.postId]: [...existing, action.comment],
        },
      };
    }

    case "CREATE_POST": {
      const next: DemoState = {
        ...state,
        createdPosts: [action.post, ...state.createdPosts],
      };
      if (action.date) next.createdDates = [action.date, ...state.createdDates];
      if (action.reproduction) {
        next.createdReproductions = [
          action.reproduction,
          ...state.createdReproductions,
        ];
        const progress = state.reproProgress[action.reproduction.originalDateId];
        if (progress) {
          next.reproProgress = {
            ...state.reproProgress,
            [action.reproduction.originalDateId]: {
              ...progress,
              postedReproductionId: action.reproduction.id,
            },
          };
        }
      }
      return next;
    }

    case "START_REPRODUCTION": {
      const existing = state.reproProgress[action.dateId];
      // Restarting a finished run resets it; resuming an unfinished run keeps progress
      if (existing && !existing.finished) return state;
      return {
        ...state,
        reproProgress: {
          ...state.reproProgress,
          [action.dateId]: {
            dateId: action.dateId,
            startedAt: action.startedAt,
            completedStops: [],
            finished: false,
          },
        },
      };
    }

    case "COMPLETE_STOP": {
      const progress = state.reproProgress[action.dateId];
      if (!progress || progress.finished) return state;
      if (progress.completedStops.includes(action.stopOrder)) return state;
      const completedStops = [...progress.completedStops, action.stopOrder].sort(
        (a, b) => a - b
      );
      return {
        ...state,
        reproProgress: {
          ...state.reproProgress,
          [action.dateId]: {
            ...progress,
            completedStops,
            finished: completedStops.length >= action.totalStops,
          },
        },
      };
    }

    case "RESET_REPRODUCTION": {
      const rest = { ...state.reproProgress };
      delete rest[action.dateId];
      return { ...state, reproProgress: rest };
    }

    case "BLOCK_ACTOR":
      return {
        ...state,
        blockedActors: { ...state.blockedActors, [action.actorId]: true },
      };

    case "REPORT_POST":
      return {
        ...state,
        reportedPosts: { ...state.reportedPosts, [action.postId]: true },
      };

    case "MARK_NOTIFICATIONS_READ":
      return { ...state, notificationsRead: true };

    case "UPDATE_PROFILE":
      return {
        ...state,
        profileOverrides: {
          displayName: action.displayName,
          bio: action.bio,
        },
      };

    case "RESET_ALL":
      return { ...initialState, onboarded: true };

    default:
      return state;
  }
}
