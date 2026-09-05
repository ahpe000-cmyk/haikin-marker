import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role の管理用クライアント（サーバー専用・RLSを通らない）。
 * 用途は「はじめる」画面の利用者一覧と、ログイン時の auth_user_id 紐付けのみに限る。
 * クライアントコンポーネントから import しないこと。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
