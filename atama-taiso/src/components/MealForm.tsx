"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  judgeMealPhoto,
  saveAiMeal,
  saveManualMeal,
} from "@/app/meals/new/actions";
import { formatJa } from "@/lib/date";
import type { MealJudgement } from "@/lib/ai/vision";

const MEAL_TYPES = [
  { value: "breakfast", label: "あさごはん" },
  { value: "lunch", label: "ひるごはん" },
  { value: "dinner", label: "ばんごはん" },
  { value: "snack", label: "おやつ" },
] as const;
type MealType = (typeof MEAL_TYPES)[number]["value"];

type Step = "start" | "judging" | "confirm" | "name" | "details" | "done";
type Props = { today: string; yesterday: string };

/** 撮った写真を長辺1024px・JPEG品質0.7に圧縮する（CLAUDE.md §6）。失敗したら null */
async function compressImage(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > 1024 ? 1024 / longest : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.7)
    );
  } catch {
    return null;
  }
}

/**
 * ごはんの記録。
 * 写真 → AI判定 → 「合っていますか?」確認 → 保存（写真はどこにも保存しない）。
 * 判定できない時は「何を食べましたか?」と聞くだけ。手書き入力もできる。
 */
export default function MealForm({ today, yesterday }: Props) {
  const [step, setStep] = useState<Step>("start");
  const [judgement, setJudgement] = useState<MealJudgement | null>(null);
  const [dish, setDish] = useState("");
  const [fromPhoto, setFromPhoto] = useState(false);
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [when, setWhen] = useState<string>(today);
  const fileInput = useRef<HTMLInputElement>(null);

  const onPhotoPicked = async (file: File | undefined) => {
    if (!file) return;
    setStep("judging");
    const compressed = await compressImage(file);
    if (!compressed) {
      // エラーは見せない。名前を聞くだけ
      setFromPhoto(false);
      setStep("name");
      return;
    }
    const fd = new FormData();
    fd.append("image", compressed, "meal.jpg");
    const result = await judgeMealPhoto(fd).catch(() => null);
    if (result) {
      setJudgement(result);
      setDish(result.dish_name);
      setFromPhoto(true);
      setStep("confirm");
    } else {
      setFromPhoto(false);
      setStep("name");
    }
  };

  const save = async () => {
    const name = dish.trim();
    if (!name) return;
    if (fromPhoto && judgement && name === judgement.dish_name) {
      await saveAiMeal(when, mealType, name, judgement.ingredients).catch(
        () => {}
      );
    } else {
      await saveManualMeal(when, mealType, name).catch(() => {});
    }
    setStep("done");
  };

  if (step === "start") {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="text-2xl font-bold">ごはんを記録</h1>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onPhotoPicked(e.target.files?.[0])}
        />
        <button
          className="btn btn-primary py-5 text-xl"
          onClick={() => fileInput.current?.click()}
        >
          しゃしんを とる
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setFromPhoto(false);
            setStep("name");
          }}
        >
          じぶんで 書く
        </button>
        <Link href="/" className="btn btn-quiet mt-auto">
          あとで
        </Link>
      </div>
    );
  }

  if (step === "judging") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="text-2xl font-bold">しらべています…</p>
        <p>すこしだけ お待ちください</p>
      </div>
    );
  }

  if (step === "confirm" && judgement) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <p className="text-2xl font-bold leading-relaxed">
          「{judgement.dish_name}」で 合っていますか?
        </p>
        {judgement.ingredients.length > 0 && (
          <p className="text-[#8a6d3b]">
            ざいりょう：{judgement.ingredients.join("、")}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3">
          <button className="btn btn-primary" onClick={() => setStep("details")}>
            はい
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setDish("");
              setFromPhoto(false);
              setStep("name");
            }}
          >
            ちがう（じぶんで 書く）
          </button>
        </div>
      </div>
    );
  }

  if (step === "name") {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-2xl font-bold">なにを 食べましたか?</p>
        <input
          className="input-big"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          placeholder="れい：やきざかな"
        />
        <p className="text-sm text-[#8a6d3b]">
          キーボードのマイクのボタンで、声でも入力できます
        </p>
        <div className="mt-auto flex flex-col gap-3">
          <button
            className="btn btn-primary"
            disabled={!dish.trim()}
            onClick={() => setStep("details")}
          >
            つぎへ
          </button>
          <Link href="/" className="btn btn-quiet">
            あとで
          </Link>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-xl font-bold">「{dish.trim()}」を記録します</p>

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
            className={
              "btn " + (when === today ? "btn-primary" : "btn-secondary")
            }
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
          <button className="btn btn-primary" onClick={() => void save()}>
            おくる
          </button>
          <Link href="/" className="btn btn-quiet">
            あとで
          </Link>
        </div>
      </div>
    );
  }

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
