import { redirect } from "next/navigation";
import SetupPending from "@/components/SetupPending";
import LoginFlow from "@/components/LoginFlow";
import { getCurrentAppUser, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HajimeruPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (user) redirect(user.role === "watcher" ? "/watch" : "/");
  return <LoginFlow />;
}
