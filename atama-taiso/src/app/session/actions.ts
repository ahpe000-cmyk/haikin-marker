"use server";

import { createClient, getCurrentAppUser } from "@/lib/supabase/server";
import { addDays, todayJst } from "@/lib/date";

/**
 * 毎朝のルーティンの保存処理。
 * どれも失敗しても throw せず false を返す（本人にエラーを見せない。壊れない優先）。
 * 行の所有権はRLSが守る（本人以外の行は書けない）。
 */

export async function recordQuizAnswer(
  sessionId: string,
  questionId: string,
  isCorrect: boolean
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("quiz_answers").insert({
      session_id: sessionId,
      question_id: questionId,
      is_correct: isCorrect,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function finishQuiz(
  sessionId: string,
  correctCount: number
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("daily_sessions")
      .update({ quiz_correct: correctCount })
      .eq("id", sessionId);
    return !error;
  } catch {
    return false;
  }
}

export async function saveMemoryQuizResult(
  sessionId: string,
  isCorrect: boolean
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("daily_sessions")
      .update({ memory_quiz_correct: isCorrect })
      .eq("id", sessionId);
    return !error;
  } catch {
    return false;
  }
}

/** きのう・おとといの夕飯の記憶入力（source = memory_input） */
export async function saveDinnerMemory(
  eatenOn: string,
  dishName: string
): Promise<boolean> {
  const name = dishName.trim();
  if (!name) return false;
  try {
    const user = await getCurrentAppUser();
    if (!user) return false;
    const supabase = await createClient();
    const { error } = await supabase.from("meals").insert({
      user_id: user.id,
      eaten_on: eatenOn,
      meal_type: "dinner",
      dish_name: name,
      source: "memory_input",
      confirmed: true,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function saveEffortNote(
  sessionId: string,
  note: string
): Promise<boolean> {
  const text = note.trim();
  if (!text) return false;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("daily_sessions")
      .update({ effort_note: text })
      .eq("id", sessionId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * ルーティン完了。completed_at を記録し、連続日数を更新する。
 * - きのうも完了していた → +1
 * - 1日以上あいた → 1 から数え直し（受け入れ基準4）
 * - きょう既に完了済み → 変えない（二重実行しても壊れない）
 */
export async function completeSession(sessionId: string): Promise<boolean> {
  try {
    const user = await getCurrentAppUser();
    if (!user) return false;
    const supabase = await createClient();
    const today = todayJst();

    const { error } = await supabase
      .from("daily_sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .is("completed_at", null);
    if (error) return false;

    if (user.last_active_on === today) return true;
    const newStreak =
      user.last_active_on === addDays(today, -1) ? user.streak_days + 1 : 1;
    await supabase
      .from("users")
      .update({ streak_days: newStreak, last_active_on: today })
      .eq("id", user.id);
    return true;
  } catch {
    return false;
  }
}
