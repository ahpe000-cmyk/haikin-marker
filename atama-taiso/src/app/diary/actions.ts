"use server";

import { createClient, getCurrentAppUser } from "@/lib/supabase/server";
import { todayJst } from "@/lib/date";

/** きょうの日記を保存（3分類・すべて任意。空欄はそのままでよい） */
export async function saveDiary(
  done: string,
  notDone: string,
  tomorrow: string
): Promise<boolean> {
  try {
    const user = await getCurrentAppUser();
    if (!user) return false;
    const supabase = await createClient();
    const { error } = await supabase.from("diary_entries").upsert(
      {
        user_id: user.id,
        entry_date: todayJst(),
        done: done.trim() || null,
        not_done: notDone.trim() || null,
        tomorrow: tomorrow.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entry_date" }
    );
    return !error;
  } catch {
    return false;
  }
}
