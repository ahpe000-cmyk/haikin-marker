import type {
  Category,
  ChoiceId,
  Question,
  QuizSession,
  SessionAnswer,
  SessionKind,
  Step,
} from "@/lib/domain/types";
import type {
  EvergreenCategory,
  ProgressState,
  StreakState,
} from "@/lib/storage/local-progress";
import { calculateSessionScore, questionWeight } from "@/lib/scoring/work-iq";
import { addWrongAnswer, applyReviewAnswer } from "@/lib/review/scheduler";
import { diffDateKeys } from "@/lib/time/jst";

/** Correct answers (out of 5) required to unlock the next STEP. */
export const STEP_PASS_THRESHOLD = 4;
export const MAX_STEP = 5;

export function createSession(input: {
  kind: SessionKind;
  questions: Question[];
  dateKey: string;
  category?: Category;
  step?: Step;
}): QuizSession {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    id: `${input.dateKey}-${input.kind}-${suffix}`,
    kind: input.kind,
    category: input.category,
    step: input.step,
    dateKey: input.dateKey,
    questionIds: input.questions.map((q) => q.id),
    answers: [],
  };
}

export function scoreAnswer(
  question: Question,
  selectedChoiceId: ChoiceId,
): SessionAnswer {
  const answerId =
    question.mode === "single_correct"
      ? question.correctChoiceId
      : question.recommendedChoiceId;
  return {
    questionId: question.id,
    category: question.category,
    mode: question.mode,
    selectedChoiceId,
    isCorrect: selectedChoiceId === answerId,
    weight: questionWeight(question),
  };
}

export function completeSession(session: QuizSession): QuizSession {
  return {
    ...session,
    completedAt: new Date().toISOString(),
    sessionScore: calculateSessionScore(session.answers),
  };
}

export function correctCount(session: QuizSession): number {
  return session.answers.filter((a) => a.isCorrect).length;
}

export function isStepPassed(session: QuizSession): boolean {
  return correctCount(session) >= STEP_PASS_THRESHOLD;
}

/**
 * Streak: a day counts only when a 5-question scored session is completed.
 * Poll-only participation never extends the streak. JST calendar dates.
 */
export function advanceStreak(streak: StreakState, dateKey: string): StreakState {
  if (streak.lastDateKey === dateKey) return streak;
  if (streak.lastDateKey && diffDateKeys(dateKey, streak.lastDateKey) === 1) {
    return { current: streak.current + 1, lastDateKey: dateKey };
  }
  return { current: 1, lastDateKey: dateKey };
}

/** Sessions long enough to count for the daily streak. */
const STREAK_SESSION_LENGTH = 5;

/**
 * Applies a completed session to progress: answer history, streak,
 * STEP unlocks, review queue, and recent-question memory.
 * Pure: returns a new state.
 */
export function applyCompletedSession(
  progress: ProgressState,
  session: QuizSession,
): ProgressState {
  if (session.answers.length === 0) return progress;
  const dateKey = session.dateKey;

  const answerHistory = [
    ...progress.answerHistory,
    ...session.answers.map((a) => ({
      questionId: a.questionId,
      category: a.category,
      isCorrect: a.isCorrect,
      weight: a.weight,
      dateKey,
    })),
  ];

  let reviewQueue = progress.reviewQueue;
  for (const answer of session.answers) {
    if (session.kind === "review") {
      reviewQueue = applyReviewAnswer(
        reviewQueue,
        answer.questionId,
        answer.isCorrect,
        dateKey,
      );
    } else if (!answer.isCorrect) {
      reviewQueue = addWrongAnswer(
        reviewQueue,
        answer.questionId,
        answer.category,
        dateKey,
      );
    }
  }

  const stepUnlocks = { ...progress.stepUnlocks };
  if (
    session.kind === "step" &&
    session.category &&
    session.category !== "current_affairs" &&
    session.step !== undefined &&
    isStepPassed(session)
  ) {
    const category = session.category as EvergreenCategory;
    const unlocked = Math.min(MAX_STEP, session.step + 1);
    stepUnlocks[category] = Math.max(stepUnlocks[category], unlocked);
  }

  const streak =
    session.answers.length >= STREAK_SESSION_LENGTH
      ? advanceStreak(progress.streak, dateKey)
      : progress.streak;

  const recentQuestions = [
    ...progress.recentQuestions.filter(
      (entry) => !session.questionIds.includes(entry.id),
    ),
    ...session.questionIds.map((id) => ({ id, dateKey })),
  ];

  return {
    ...progress,
    sessions: [...progress.sessions, session],
    answerHistory,
    reviewQueue,
    stepUnlocks,
    streak,
    recentQuestions,
  };
}
