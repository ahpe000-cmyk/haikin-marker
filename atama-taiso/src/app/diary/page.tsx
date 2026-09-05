import { redirect } from "next/navigation";
import SetupPending from "@/components/SetupPending";
import DiaryForm from "@/components/DiaryForm";
import {
  createClient,
  getCurrentAppUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { todayJst } from "@/lib/date";
import type { DiaryEntry } from "@/types/db";

export const dynamic = "force-dynamic";

/** ちょうど1ヶ月前の日付（月末は繰り上げず月内に収める） */
function monthAgo(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const lastDayPrevMonth = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
  const dt = new Date(Date.UTC(y, m - 2, Math.min(d, lastDayPrevMonth)));
  return dt.toISOString().slice(0, 10);
}

export default async function DiaryPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) redirect("/hajimeru");
  if (user.role === "watcher") redirect("/watch");

  const supabase = await createClient();
  const today = todayJst();
  const { data } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_date", today)
    .maybeSingle();
  const entry = data as DiaryEntry | null;

  return (
    <DiaryForm
      initialDone={entry?.done ?? ""}
      initialNotDone={entry?.not_done ?? ""}
      initialTomorrow={entry?.tomorrow ?? ""}
      monthAgoDate={monthAgo(today)}
    />
  );
}
