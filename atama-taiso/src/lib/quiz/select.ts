import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuizQuestion } from "@/types/db";

const QUESTIONS_PER_DAY = 5;
const MAX_PER_CATEGORY = 2;
const NO_REPEAT_DAYS = 30;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 毎朝の5問を選ぶ（CLAUDE.md §5 出題ルール）
 * - approved = true のみ
 * - 直近30日に本人へ出題した問題は除外
 * - カテゴリの偏りを避ける（最大2問/カテゴリ）
 * 問題プールが足りない日は5問未満になることを許す（30日ルールを優先）。
 */
export async function selectDailyQuestions(
  supabase: SupabaseClient,
  appUserId: string
): Promise<QuizQuestion[]> {
  const since = new Date(
    Date.now() - NO_REPEAT_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: recent } = await supabase
    .from("quiz_answers")
    .select("question_id, daily_sessions!inner(user_id)")
    .eq("daily_sessions.user_id", appUserId)
    .gte("answered_at", since);
  const recentIds = new Set((recent ?? []).map((r) => r.question_id as string));

  const { data: pool } = await supabase
    .from("quiz_questions")
    .select("id, category")
    .eq("approved", true);
  const candidates = shuffle(
    (pool ?? []).filter((q) => !recentIds.has(q.id as string))
  );

  const picked: string[] = [];
  const perCategory = new Map<string, number>();
  for (const q of candidates) {
    if (picked.length >= QUESTIONS_PER_DAY) break;
    const c = (perCategory.get(q.category as string) ?? 0) + 1;
    if (c > MAX_PER_CATEGORY) continue;
    perCategory.set(q.category as string, c);
    picked.push(q.id as string);
  }
  if (picked.length === 0) return [];

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .in("id", picked);
  const byId = new Map((questions ?? []).map((q) => [q.id as string, q]));
  return picked
    .map((id) => byId.get(id))
    .filter(Boolean) as QuizQuestion[];
}
