"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "@/hooks/useDemoStore";
import { useToast } from "@/components/dd/Toast";

export function SaveButton({
  planId,
  variant = "icon",
}: {
  planId: string;
  variant?: "icon" | "button";
}) {
  const { isSaved, toggleSave } = useDemoStore();
  const { showToast } = useToast();
  const [pop, setPop] = useState(false);
  const saved = isSaved(planId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(planId);
    setPop(true);
    setTimeout(() => setPop(false), 300);
    showToast(saved ? "保存を解除しました" : "デートを保存しました");
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
          saved
            ? "border-[var(--dd-ink)] bg-[var(--dd-ink)] text-white"
            : "border-[var(--dd-line)] bg-white text-[var(--dd-ink)]"
        }`}
      >
        <Bookmark
          className={`h-5 w-5 ${pop ? "dd-pop" : ""} ${saved ? "fill-current" : ""}`}
          aria-hidden
        />
        {saved ? "保存済み" : "保存"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "保存を解除" : "保存する"}
      className="rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition-transform active:scale-90"
    >
      <Bookmark
        className={`h-5 w-5 ${pop ? "dd-pop" : ""} ${
          saved ? "fill-[var(--dd-accent)] text-[var(--dd-accent)]" : "text-neutral-700"
        }`}
        aria-hidden
      />
    </button>
  );
}
