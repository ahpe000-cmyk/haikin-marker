"use client";

import { useEffect } from "react";

export default function RegisterSw() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 失敗しても本人には見せない（アプリはそのまま使える）
      });
    }
  }, []);
  return null;
}
