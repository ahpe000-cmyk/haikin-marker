export type AppUser = {
  id: string;
  auth_user_id: string | null;
  display_name: string;
  role: "senior" | "watcher";
  line_user_id: string | null;
  share_with_watcher: boolean;
  streak_days: number;
  last_active_on: string | null; // YYYY-MM-DD
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  category: "math" | "history" | "geography" | "heritage" | "general";
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string | null;
  difficulty: number;
  approved: boolean;
};

export type DailySession = {
  id: string;
  user_id: string;
  session_date: string; // YYYY-MM-DD
  quiz_correct: number | null;
  memory_quiz_correct: boolean | null;
  effort_note: string | null;
  completed_at: string | null;
};

export type Meal = {
  id: string;
  user_id: string;
  eaten_on: string; // YYYY-MM-DD
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  dish_name: string;
  ingredients: string[] | null;
  source: "photo_ai" | "manual" | "memory_input";
  confirmed: boolean;
  created_at: string;
};

export type DiaryEntry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  done: string | null;
  not_done: string | null;
  tomorrow: string | null;
  updated_at: string;
};

/** 記憶クイズ1問ぶん（quiz/memory.ts が生成） */
export type MemoryQuiz = {
  targetDate: string; // YYYY-MM-DD（何日の夕飯を聞くか）
  question: string;
  choices: string[];
  answerIndex: number;
};
