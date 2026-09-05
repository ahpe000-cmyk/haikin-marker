import Link from "next/link";
import SetupPending from "@/components/SetupPending";
import SessionFlow from "@/components/SessionFlow";
import {
  createClient,
  getCurrentAppUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { selectDailyQuestions } from "@/lib/quiz/select";
import { buildMemoryQuiz } from "@/lib/quiz/memory";
import { addDays, formatJa, todayJst } from "@/lib/date";
import type { DailySession, Meal } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) return <SetupPending />;

  const supabase = await createClient();
  const today = todayJst();

  // きょうのセッション行を用意する（既にあればそのまま使う）
  const { data: session } = await supabase
    .from("daily_sessions")
    .upsert(
      { user_id: user.id, session_date: today },
      { onConflict: "user_id,session_date", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (!session) {
    // 通信の不調など。エラー画面は見せず、静かにホームへ促す
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="text-2xl font-bold">すこし お待ちください</p>
        <p>うまく つながりませんでした。もういちど おためしください。</p>
        <Link href="/" className="btn btn-primary">
          もどる
        </Link>
      </div>
    );
  }

  const s = session as DailySession;

  // 完了済みなら「おわり画面」（きょうの記録）を出す
  if (s.completed_at) {
    const { data: meals } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .in("eaten_on", [addDays(today, -1), addDays(today, -2)])
      .eq("meal_type", "dinner")
      .order("eaten_on", { ascending: false });
    return (
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="text-2xl font-bold">きょうは おわりました</h1>
        <p>おつかれさまでした。また あした。</p>
        <div className="card flex flex-col gap-3">
          <p className="font-bold">きょうの記録（{formatJa(today)}）</p>
          <p>
            クイズ：
            {s.quiz_correct == null ? "きょうは やっていません" : `${s.quiz_correct}問 正解`}
          </p>
          {s.memory_quiz_correct != null && (
            <p>おもいだしクイズ：{s.memory_quiz_correct ? "正解" : "ざんねん"}</p>
          )}
          {(meals as Meal[] | null)?.map((m) => (
            <p key={m.id}>
              {formatJa(m.eaten_on)}の夕ごはん：{m.dish_name}
            </p>
          ))}
          {s.effort_note && <p>きょう頑張ること：{s.effort_note}</p>}
        </div>
        <Link href="/" className="btn btn-primary">
          もどる
        </Link>
      </div>
    );
  }

  const questions = await selectDailyQuestions(supabase, user.id);
  const memoryQuiz =
    s.memory_quiz_correct == null
      ? await buildMemoryQuiz(supabase, user.id, today)
      : null;

  return (
    <SessionFlow
      sessionId={s.id}
      questions={questions}
      memoryQuiz={memoryQuiz}
      today={today}
      yesterday={addDays(today, -1)}
      dayBefore={addDays(today, -2)}
    />
  );
}
