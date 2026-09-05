"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 4桁のあいことばで、選んだ利用者とこの端末（匿名ログイン）を結びつける。
 * あいことばの値はコードに書かず、環境変数 APP_PASSCODE で照合する（掟3）。
 * まちがえても責めない文言を返す。詳細な失敗理由は本人に見せない。
 */
export async function bindLogin(
  appUserId: string,
  code: string
): Promise<{ ok: boolean; message?: string }> {
  const tryAgain = "ちがうようです。もういちど おためしください。";
  try {
    const passcode = process.env.APP_PASSCODE;
    if (!passcode) {
      return { ok: false, message: "じゅんびちゅうです。すこし お待ちください。" };
    }
    if (code !== passcode) {
      return { ok: false, message: tryAgain };
    }

    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      return { ok: false, message: tryAgain };
    }

    const admin = createAdminClient();
    if (!admin) {
      return { ok: false, message: "じゅんびちゅうです。すこし お待ちください。" };
    }

    // 同じ端末（同じ匿名ID）が別の人に結びついていたら外してから結び直す
    await admin
      .from("users")
      .update({ auth_user_id: null })
      .eq("auth_user_id", authUser.id)
      .neq("id", appUserId);
    const { error } = await admin
      .from("users")
      .update({ auth_user_id: authUser.id })
      .eq("id", appUserId);
    if (error) return { ok: false, message: tryAgain };
    return { ok: true };
  } catch {
    return { ok: false, message: tryAgain };
  }
}
