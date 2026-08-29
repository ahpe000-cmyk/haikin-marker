// ---------- storage helpers（存在しないキーはthrowするため安全に包む） ----------
export async function sGet(key, fallback) {
  try {
    const r = await window.storage.get(key);
    if (r && r.value != null) return JSON.parse(r.value);
  } catch (e) { /* キー未作成 */ }
  return fallback;
}

export async function sSet(key, obj) {
  try { await window.storage.set(key, JSON.stringify(obj)); } catch (e) { console.error("storage set失敗:", key, e); }
}
