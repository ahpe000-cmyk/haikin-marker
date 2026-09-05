"use client";

import { useEffect, useState } from "react";

const SIZES = [
  { value: "futsuu", label: "ふつう" },
  { value: "ookii", label: "おおきい" },
  { value: "tokudai", label: "とくだい" },
] as const;

/** 文字サイズの設定（この機械の中だけに保存。ほかの人には影響しない） */
export default function MojiSize() {
  const [size, setSize] = useState<string>("futsuu");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("moji-size");
      if (saved) setSize(saved);
    } catch {}
  }, []);

  const apply = (v: string) => {
    setSize(v);
    try {
      localStorage.setItem("moji-size", v);
    } catch {}
    if (v === "futsuu") {
      document.documentElement.removeAttribute("data-moji");
    } else {
      document.documentElement.setAttribute("data-moji", v);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {SIZES.map((s) => (
        <button
          key={s.value}
          className={"btn " + (size === s.value ? "btn-primary" : "btn-secondary")}
          onClick={() => apply(s.value)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
