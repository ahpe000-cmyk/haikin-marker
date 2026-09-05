import SetupPending from "@/components/SetupPending";
import MealForm from "@/components/MealForm";
import { getCurrentAppUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { addDays, todayJst } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function NewMealPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) return <SetupPending />;

  const today = todayJst();
  return <MealForm today={today} yesterday={addDays(today, -1)} />;
}
