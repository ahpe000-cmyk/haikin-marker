import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AppUser } from "@/types/db";

/** Supabaseの環境変数が設定されているか（未設定なら「じゅんびちゅう」画面を出す） */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出しでは set できない（middleware不要の範囲では無視でよい）
          }
        },
      },
    }
  );
}

/**
 * ログイン中の利用者（usersテーブルの行）を返す。
 * 未ログイン・未登録なら null。
 * ログイン方式そのものは判断待ち（docs/PENDING.md 14-1）。決定後、
 * ここはそのまま使い、ログイン画面（PR #3）だけを足せばよい。
 */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return (data as AppUser) ?? null;
}
