"use server";

import { createClient, getCurrentAppUser } from "@/lib/supabase/server";

/**
 * ごはんの手入力記録（P1版）。
 * カメラ + AI判定（source = photo_ai）は PR #8 でこの画面に足す。
 */
export async function saveManualMeal(
  eatenOn: string,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  dishName: string
): Promise<boolean> {
  const name = dishName.trim();
  if (!name) return false;
  try {
    const user = await getCurrentAppUser();
    if (!user) return false;
    const supabase = await createClient();
    const { error } = await supabase.from("meals").insert({
      user_id: user.id,
      eaten_on: eatenOn,
      meal_type: mealType,
      dish_name: name,
      source: "manual",
      confirmed: true,
    });
    return !error;
  } catch {
    return false;
  }
}
