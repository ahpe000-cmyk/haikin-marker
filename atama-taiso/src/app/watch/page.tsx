import Link from "next/link";
import { redirect } from "next/navigation";
import SetupPending from "@/components/SetupPending";
import {
  createClient,
  getCurrentAppUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { addDays, formatJa, todayJst } from "@/lib/date";
import type { AppUser, DailySession, DiaryEntry, Meal } from "@/types/db";

export const dynamic = "force-dynamic";

const MEAL_LABEL: Record<string, string> = {
  breakfast: "朝",
  lunch: "昼",
  dinner: "晩",
  snack: "間食",
};

/**
 * 見守りダッシュボード（CLAUDE.md §7）。
 * 見えるのは「本人が共有ONにしている人」だけ（RLSが保証。OFFの人の行は取得できない）。
 * 共有の要求・変更ボタンはここに置かない。
 */
export default async function WatchPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) redirect("/hajimeru");
  if (user.role !== "watcher") redirect("/");

  const supabase = await createClient();
  const today = todayJst();
  const weekAgo = addDays(today, -6);

  // RLSにより、共有ONかつ紐付いたseniorの行だけが返る
  const { data: seniors } = await supabase
    .from("users")
    .select("*")
    .eq("role", "senior")
    .order("display_name");

  const cards = await Promise.all(
    ((seniors ?? []) as AppUser[]).map(async (s) => {
      const [{ data: session }, { data: meals }, { data: diaries }] =
        await Promise.all([
          supabase
            .from("daily_sessions")
            .select("*")
            .eq("user_id", s.id)
            .eq("session_date", today)
            .maybeSingle(),
          supabase
            .from("meals")
            .select("*")
            .eq("user_id", s.id)
            .gte("eaten_on", weekAgo)
            .lte("eaten_on", today)
            .order("eaten_on", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("diary_entries")
            .select("*")
            .eq("user_id", s.id)
            .gte("entry_date", weekAgo)
            .lte("entry_date", today)
            .order("entry_date", { ascending: false })
            .limit(3),
        ]);
      return {
        senior: s,
        session: session as DailySession | null,
        meals: (meals ?? []) as Meal[],
        diaries: (diaries ?? []) as DiaryEntry[],
      };
    })
  );

  const streakOf = (s: AppUser) =>
    s.last_active_on === today || s.last_active_on === addDays(today, -1)
      ? s.streak_days
      : 0;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <h1 className="text-2xl font-bold">見守り（{formatJa(today)}）</h1>

      {cards.length === 0 && (
        <div className="card">
          <p>
            いま見られる記録はありません。ご本人の設定で「見せる」がオフに
            なっているか、まだ利用が始まっていません。
          </p>
        </div>
      )}

      {cards.map(({ senior, session, meals, diaries }) => (
        <section key={senior.id} className="card flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold">{senior.display_name}</p>
            <p className="text-sm text-[#8a6d3b]">連続 {streakOf(senior)}日</p>
          </div>

          <p>
            今日のルーティン：
            {session?.completed_at ? (
              <span className="font-bold text-[#4c9a3d]">完了</span>
            ) : (
              <span className="font-bold text-[#a05252]">まだ</span>
            )}
            {session?.quiz_correct != null &&
              `（クイズ ${session.quiz_correct}問正解）`}
          </p>

          <div>
            <p className="font-bold">直近7日の食事（{meals.length}件）</p>
            {meals.length === 0 ? (
              <p className="text-sm text-[#8a6d3b]">記録はありません</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1 text-sm">
                {meals.slice(0, 10).map((m) => (
                  <li key={m.id}>
                    {formatJa(m.eaten_on)} {MEAL_LABEL[m.meal_type]}：
                    {m.dish_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="font-bold">日記（直近3件）</p>
            {diaries.length === 0 ? (
              <p className="text-sm text-[#8a6d3b]">記録はありません</p>
            ) : (
              diaries.map((d) => (
                <div key={d.id} className="mt-1 text-sm">
                  <p className="font-bold">{formatJa(d.entry_date)}</p>
                  {d.done && <p>できたこと：{d.done}</p>}
                  {d.not_done && <p>できなかったこと：{d.not_done}</p>}
                  {d.tomorrow && <p>明日やりたいこと：{d.tomorrow}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      ))}

      <Link href="/settings" className="btn btn-quiet mt-auto w-auto self-center">
        せってい
      </Link>
    </div>
  );
}
