import { redirect } from "next/navigation";
import SetupPending from "@/components/SetupPending";
import LoginFlow from "@/components/LoginFlow";
import { getCurrentAppUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HajimeruPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (user) redirect(user.role === "watcher" ? "/watch" : "/");

  const admin = createAdminClient();
  if (!admin) return <SetupPending />;
  const { data: people } = await admin
    .from("users")
    .select("id, display_name, role")
    .order("role", { ascending: false }) // senior が先
    .order("display_name");

  if (!people || people.length === 0) return <SetupPending />;

  return (
    <LoginFlow
      people={people as { id: string; display_name: string; role: string }[]}
    />
  );
}
