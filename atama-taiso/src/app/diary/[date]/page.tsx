import Link from "next/link";
import { redirect } from "next/navigation";
import SetupPending from "@/components/SetupPending";
import {
  createClient,
  getCurrentAppUser,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { formatJaFull } from "@/lib/date";
import type { DiaryEntry } from "@/types/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ date: string }> };

export default async function DiaryDatePage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <p className="text-xl font-bold">この日は ひらけません</p>
        <Link href="/diary" className="btn btn-primary">
          もどる
        </Link>
      </div>
    );
  }

  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) redirect("/hajimeru");
  if (user.role === "watcher") redirect("/watch");

  const supabase = await createClient();
  const { data } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_date", date)
    .maybeSingle();
  const entry = data as DiaryEntry | null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">{formatJaFull(date)}の日記</h1>
      {entry ? (
        <div className="card flex flex-col gap-4">
          <div>
            <p className="font-bold">できたこと</p>
            <p className="mt-1 whitespace-pre-wrap">
              {entry.done ?? "（かいていません）"}
            </p>
          </div>
          <div>
            <p className="font-bold">できなかったこと</p>
            <p className="mt-1 whitespace-pre-wrap">
              {entry.not_done ?? "（かいていません）"}
            </p>
          </div>
          <div>
            <p className="font-bold">あした やりたいこと</p>
            <p className="mt-1 whitespace-pre-wrap">
              {entry.tomorrow ?? "（かいていません）"}
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>この日は 日記を かいていません。</p>
        </div>
      )}
      <div className="mt-auto flex flex-col gap-3">
        <Link href="/diary" className="btn btn-primary">
          きょうの日記へ
        </Link>
        <Link href="/history" className="btn btn-quiet">
          カレンダーへ
        </Link>
      </div>
    </div>
  );
}
