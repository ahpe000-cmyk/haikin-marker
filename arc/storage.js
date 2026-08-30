// ---------- storage helpers ----------
// アーティファクト環境: window.storage / Web環境: localStorage に自動フォールバック
const hasArtifactStorage = () =>
  typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

export async function sGet(key, fallback) {
  try {
    if (hasArtifactStorage()) {
      const r = await window.storage.get(key);
      if (r && r.value != null) return JSON.parse(r.value);
    } else {
      const v = localStorage.getItem(key);
      if (v != null) return JSON.parse(v);
    }
  } catch (e) { /* キー未作成 */ }
  return fallback;
}

export async function sSet(key, obj) {
  try {
    if (hasArtifactStorage()) {
      await window.storage.set(key, JSON.stringify(obj));
    } else {
      localStorage.setItem(key, JSON.stringify(obj));
    }
  } catch (e) { console.error("storage set失敗:", key, e); }
}
