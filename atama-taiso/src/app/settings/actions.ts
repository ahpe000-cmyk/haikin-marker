"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentAppUser } from "@/lib/supabase/server";

/**
 * 見守り共有のON/OFF。本人（senior）が自分の行を切り替える。
 * watcher からは変更できない（RLSでも本人以外のUPDATEを許可しない）。
 */
export async function setShareWithWatcher(share: boolean): Promise<boolean> {
  try {
    const user = await getCurrentAppUser();
    if (!user) return false;
    const supabase = await createClient();
    const { error } = await supabase
      .from("users")
      .update({ share_with_watcher: share })
      .eq("id", user.id);
    revalidatePath("/settings");
    return !error;
  } catch {
    return false;
  }
}
