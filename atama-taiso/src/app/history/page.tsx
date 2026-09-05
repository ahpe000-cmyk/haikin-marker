import Link from "next/link";
import { redirect } from "next/navigation";
import SetupPending from "@/components/SetupPending";
import {
  createClient,
  getCurrentAppUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { formatJa, todayJst } from "@/lib/date";
import type { DailySession, Meal } from "@/types/db";

export const dynamic = "force-dynamic";

const MEAL_LABEL: Record<string, string> = {
  breakfast: "あさ",
  lunch: "ひる",
  dinner: "ばん",
  snack: "おやつ",
};

type Props = {
  searchParams: Promise<{ month?: string; day?: string }>;
};

function monthShift(ym: string, diff: number): string {
  const [y, m] = ym.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + diff, 1));
  return dt.toISOString().slice(0, 7);
}

export default async function HistoryPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) redirect("/hajimeru");
  if (user.role === "watcher") redirect("/watch");

  const today = todayJst();
  const sp = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "")
    ? (sp.month as string)
    : today.slice(0, 7);
  const selectedDay =
    sp.day && /^\d{4}-\d{2}-\d{2}$/.test(sp.day) ? sp.day : null;

  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-${String(daysInMonth).padStart(2, "0")}`;

  const supabase = await createClient();
  const [{ data: sessions }, { data: meals }, { data: diaries }] =
    await Promise.all([
      supabase
        .from("daily_sessions")
        .select("session_date, quiz_correct, memory_quiz_correct, effort_note, completed_at")
        .eq("user_id", user.id)
        .gte("session_date", monthStart)
        .lte("session_date", monthEnd),
      supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("eaten_on", monthStart)
        .lte("eaten_on", monthEnd),
      supabase
        .from("diary_entries")
        .select("entry_date")
        .eq("user_id", user.id)
        .gte("entry_date", monthStart)
        .lte("entry_date", monthEnd),
    ]);

  const completedDays = new Set(
    (sessions ?? [])
      .filter((s) => s.completed_at)
      .map((s) => s.session_date as string)
  );
  const diaryDays = new Set((diaries ?? []).map((d) => d.entry_date as string));
  const mealDays = new Set((meals ?? []).map((mm) => mm.eaten_on as string));

  const detailSession = selectedDay
    ? ((sessions ?? []).find(
        (s) => s.session_date === selectedDay
      ) as DailySession | undefined)
    : undefined;
  const detailMeals = selectedDay
    ? ((meals ?? []).filter((mm) => mm.eaten_on === selectedDay) as Meal[])
    : [];

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">これまでの記録</h1>

      <div className="flex items-center justify-between">
        <Link
          href={`/history?month=${monthShift(month, -1)}`}
          className="btn btn-secondary w-auto px-4"
        >
          ← まえの月
        </Link>
        <p className="text-xl font-bold">
          {y}年{m}月
        </p>
        <Link
          href={`/history?month=${monthShift(month, 1)}`}
          className="btn btn-secondary w-auto px-4"
        >
          つぎの月 →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
          <p key={w} className="py-1 text-sm font-bold text-[#8a6d3b]">
            {w}
          </p>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const ymd = `${month}-${String(d).padStart(2, "0")}`;
          const hasAny =
            completedDays.has(ymd) || diaryDays.has(ymd) || mealDays.has(ymd);
          const isSelected = ymd === selectedDay;
          return (
            <Link
              key={ymd}
              href={`/history?month=${month}&day=${ymd}`}
              className={
                "flex min-h-12 flex-col items-center justify-center rounded-lg border-2 " +
                (isSelected
                  ? "border-[#f57c1f] bg-[#fdeacc]"
                  : hasAny
                    ? "border-[#e5d5b8] bg-white"
                    : "border-transparent")
              }
            >
              <span className={ymd === today ? "font-bold" : ""}>{d}</span>
              {completedDays.has(ymd) && (
                <span className="text-xs leading-none text-[#f57c1f]">●</span>
              )}
            </Link>
          );
        })}
      </div>
      <p className="text-sm text-[#8a6d3b]">
        ● は 朝の頭の体操を おえた日です。日にちを おすと その日の記録が見られます。
      </p>

      {selectedDay && (
        <div className="card flex flex-col gap-3">
          <p className="font-bold">{formatJa(selectedDay)}の記録</p>
          {detailSession?.completed_at ? (
            <p>
              頭の体操：おわりました
              {detailSession.quiz_correct != null &&
                `（クイズ ${detailSession.quiz_correct}問 正解）`}
            </p>
          ) : (
            <p>頭の体操：この日は やっていません</p>
          )}
          {detailSession?.effort_note && (
            <p>頑張ること：{detailSession.effort_note}</p>
          )}
          {detailMeals.length > 0 ? (
            detailMeals.map((mm) => (
              <p key={mm.id}>
                ごはん（{MEAL_LABEL[mm.meal_type]}）：{mm.dish_name}
              </p>
            ))
          ) : (
            <p>ごはん：記録は ありません</p>
          )}
          {diaryDays.has(selectedDay) ? (
            <Link href={`/diary/${selectedDay}`} className="btn btn-secondary">
              この日の日記を ひらく
            </Link>
          ) : (
            <p>日記：かいていません</p>
          )}
        </div>
      )}

      <Link href="/" className="btn btn-primary mt-auto">
        もどる
      </Link>
    </div>
  );
}
