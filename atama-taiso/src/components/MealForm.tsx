"use client";

import { useState } from "react";
import Link from "next/link";
import { saveManualMeal } from "@/app/meals/new/actions";
import { formatJa } from "@/lib/date";

const MEAL_TYPES = [
  { value: "breakfast", label: "あさごはん" },
  { value: "lunch", label: "ひるごはん" },
  { value: "dinner", label: "ばんごはん" },
  { value: "snack", label: "おやつ" },
] as const;

type Props = { today: string; yesterday: string };

/**
 * ごはんの記録（P1は手入力）。
 * カメラで撮って自動で名前がつく機能は PR #8 でこの画面に足す。
 */
export default function MealForm({ today, yesterday }: Props) {
  const [dish, setDish] = useState("");
  const [mealType, setMealType] =
    useState<(typeof MEAL_TYPES)[number]["value"]>("dinner");
  const [when, setWhen] = useState<string>(today);
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="text-2xl font-bold">きろくしました</p>
        <p>ごちそうさまでした。</p>
        <Link href="/" className="btn btn-primary">
          もどる
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">ごはんを記録</h1>

      <p className="font-bold">なにを 食べましたか?</p>
      <input
        className="input-big"
        value={dish}
        onChange={(e) => setDish(e.target.value)}
        placeholder="れい：やきざかな"
      />
      <p className="text-sm text-[#8a6d3b]">
        キーボードのマイクのボタンで、声でも入力できます
      </p>

      <p className="font-bold">どの ごはんですか?</p>
      <div className="grid grid-cols-2 gap-3">
        {MEAL_TYPES.map((t) => (
          <button
            key={t.value}
            className={
              "btn " + (mealType === t.value ? "btn-primary" : "btn-secondary")
            }
            onClick={() => setMealType(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="font-bold">いつの ごはんですか?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          className={"btn " + (when === today ? "btn-primary" : "btn-secondary")}
          onClick={() => setWhen(today)}
        >
          きょう
        </button>
        <button
          className={
            "btn " + (when === yesterday ? "btn-primary" : "btn-secondary")
          }
          onClick={() => setWhen(yesterday)}
        >
          きのう（{formatJa(yesterday)}）
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          className="btn btn-primary"
          disabled={!dish.trim()}
          onClick={async () => {
            await saveManualMeal(when, mealType, dish).catch(() => {});
            setSaved(true);
          }}
        >
          おくる
        </button>
        <Link href="/" className="btn btn-quiet">
          あとで
        </Link>
      </div>
    </div>
  );
}
