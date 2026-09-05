import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryQuiz } from "@/types/db";
import { addDays, formatJa, weekdayJa } from "@/lib/date";

const MIN_DISTINCT_DAYS = 7;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 記憶クイズを1問つくる（CLAUDE.md §5 出題ルール）
 * - meals に7日以上前の「同じ曜日」の夕飯記録がある時のみ生成
 * - 食事データが7日分（日数）に満たない場合は出さない → null
 * - 選択肢は本人の他の日の夕飯3件 + 正解1件の4択。他人のデータは混ぜない
 *   （クエリは本人の user_id で絞る。RLSでも本人以外の行は読めない）
 * 出せない日は null を返し、画面側は何も出さない（エラーにしない）。
 */
export async function buildMemoryQuiz(
  supabase: SupabaseClient,
  appUserId: string,
  today: string
): Promise<MemoryQuiz | null> {
  const { data: dinners } = await supabase
    .from("meals")
    .select("eaten_on, dish_name")
    .eq("user_id", appUserId)
    .eq("meal_type", "dinner")
    .order("eaten_on", { ascending: false })
    .limit(200);
  if (!dinners || dinners.length === 0) return null;

  const distinctDays = new Set(dinners.map((m) => m.eaten_on as string));
  if (distinctDays.size < MIN_DISTINCT_DAYS) return null;

  // 7日以上前の同じ曜日（7日前、14日前…）のうち、記録がある最も新しい日
  let target: string | null = null;
  for (let back = 7; back <= 35; back += 7) {
    const d = addDays(today, -back);
    if (distinctDays.has(d)) {
      target = d;
      break;
    }
  }
  if (!target) return null;

  const answer = dinners.find((m) => m.eaten_on === target)!
    .dish_name as string;

  const others = Array.from(
    new Set(
      dinners
        .filter((m) => m.eaten_on !== target && m.dish_name !== answer)
        .map((m) => m.dish_name as string)
    )
  );
  if (others.length < 3) return null;
  const distractors = shuffle(others).slice(0, 3);

  const choices = shuffle([answer, ...distractors]);
  const daysAgo = Math.round(
    (Date.parse(today) - Date.parse(target)) / (24 * 60 * 60 * 1000)
  );
  const when =
    daysAgo === 7
      ? `1週間前の${weekdayJa(target)}曜日（${formatJa(target)}）`
      : `${formatJa(target)}`;

  return {
    targetDate: target,
    question: `${when}、夕ごはんに何を食べましたか?`,
    choices,
    answerIndex: choices.indexOf(answer),
  };
}
