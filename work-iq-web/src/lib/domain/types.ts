import type { z } from "zod";
import type {
  categorySchema,
  choiceIdSchema,
  choiceSchema,
  currentAffairsBatchSchema,
  dailyPollSchema,
  questionModeSchema,
  questionSchema,
  sourceInfoSchema,
  termInfoSchema,
} from "./schemas";

export type Category = z.infer<typeof categorySchema>;
export type QuestionMode = z.infer<typeof questionModeSchema>;
export type ChoiceId = z.infer<typeof choiceIdSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type SourceInfo = z.infer<typeof sourceInfoSchema>;
export type TermInfo = z.infer<typeof termInfoSchema>;
export type Question = z.infer<typeof questionSchema>;
export type DailyPoll = z.infer<typeof dailyPollSchema>;
export type CurrentAffairsBatch = z.infer<typeof currentAffairsBatchSchema>;

export type Step = 1 | 2 | 3 | 4 | 5;

export type SessionKind = "daily" | "step" | "current_affairs" | "review";

export interface SessionAnswer {
  questionId: string;
  category: Category;
  mode: QuestionMode;
  selectedChoiceId: ChoiceId;
  isCorrect: boolean;
  weight: number;
}

export interface QuizSession {
  id: string;
  kind: SessionKind;
  category?: Category;
  step?: Step;
  dateKey: string;
  questionIds: string[];
  answers: SessionAnswer[];
  completedAt?: string;
  sessionScore?: number;
}
