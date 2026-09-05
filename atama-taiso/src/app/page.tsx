import Link from "next/link";
import SetupPending from "@/components/SetupPending";
import {
  createClient,
  getCurrentAppUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { addDays, formatJaFull, hourJst, todayJst } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) return <SetupPending />;

  const today = todayJst();
  // 1日あいたら0に戻して見せる（受け入れ基準4）
  const streak =
    user.last_active_on === today || user.last_active_on === addDays(today, -1)
      ? user.streak_days
      : 0;

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("daily_sessions")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("session_date", today)
    .maybeSingle();
  const doneToday = Boolean(session?.completed_at);

  const h = hourJst();
  const greeting =
    h < 11 ? "おはようございます" : h < 18 ? "こんにちは" : "こんばんは";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="text-center">
        <p className="text-2xl font-bold">
          {greeting}、{user.display_name}
        </p>
        <p className="mt-2">{formatJaFull(today)}</p>
        <p className="mt-2 text-lg">
          {streak > 0 ? `${streak}日 つづいています` : "きょうから はじめましょう"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/session" className="btn btn-primary text-2xl py-5">
          {doneToday ? "きょうの記録を見る" : "はじめる"}
        </Link>
        <Link href="/meals/new" className="btn btn-secondary">
          ごはんを記録
        </Link>
        <Link href="/diary" className="btn btn-secondary">
          日記
        </Link>
      </div>

      <div className="mt-auto flex justify-center gap-8">
        <Link href="/history" className="btn-quiet btn w-auto">
          これまでの記録
        </Link>
        <Link href="/settings" className="btn-quiet btn w-auto">
          せってい
        </Link>
      </div>
    </div>
  );
}
