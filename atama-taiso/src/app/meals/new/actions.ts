"use server";

import { createClient, getCurrentAppUser } from "@/lib/supabase/server";
import {
  judgeMealImage,
  CONFIDENCE_MIN,
  type MealJudgement,
} from "@/lib/ai/vision";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 圧縮後の想定上限

/**
 * 写真からの食事判定（CLAUDE.md §6）。
 * 画像は変数の中だけで使い、保存もログ出力もしない。
 * 判定できない・自信が低い時は null（画面は「何を食べましたか?」と聞くだけ）。
 */
export async function judgeMealPhoto(
  formData: FormData
): Promise<MealJudgement | null> {
  try {
    const user = await getCurrentAppUser();
    if (!user) return null;
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      return null;
    }
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await judgeMealImage(base64);
    if (!result || result.confidence < CONFIDENCE_MIN) return null;
    return result;
  } catch {
    return null;
  }
}

/** AI判定の結果を保存（本人が「はい（合っている）」を押したもの） */
export async function saveAiMeal(
  eatenOn: string,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  dishName: string,
  ingredients: string[]
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
      ingredients: ingredients.slice(0, 5),
      source: "photo_ai",
      confirmed: true,
    });
    return !error;
  } catch {
    return false;
  }
}

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
