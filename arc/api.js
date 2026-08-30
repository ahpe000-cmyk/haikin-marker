// ---------- Anthropic Messages API ----------
// アーティファクト環境: 認証ヘッダー不要（環境が代理認証する）
// Web環境: ユーザー自身のAPIキーで直接呼び出し（ブラウザ直アクセス用ヘッダー必須）

export const isArtifactEnv = () => typeof window !== "undefined" && !!window.storage;

const API_KEY_STORAGE = "arc-api-key";

export function getApiKey() {
  try { return localStorage.getItem(API_KEY_STORAGE) || ""; } catch (e) { return ""; }
}

export function saveApiKey(key) {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE, key);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch (e) { /* localStorage不可の環境では保存しない */ }
}

export async function postMessages(body) {
  const headers = { "Content-Type": "application/json" };
  if (!isArtifactEnv()) {
    const key = getApiKey();
    if (!key) {
      throw new Error("APIキーが未設定です。「契約書・憲章」画面でAnthropic APIキーを保存してください。");
    }
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
    if (body.mcp_servers) headers["anthropic-beta"] = "mcp-client-2025-04-04";
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "APIエラー");
  return data;
}

// ---------- API応答のパース（typeで判別・位置に依存しない） ----------
export function extractText(data) {
  if (!data || !Array.isArray(data.content)) return "";
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

export function extractToolCalls(data) {
  if (!data || !Array.isArray(data.content)) return [];
  return data.content.filter((b) => b.type === "mcp_tool_use").map((b) => b.name);
}
