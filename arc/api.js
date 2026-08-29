// ---------- Anthropic Messages API（アーティファクト環境ではAPIキー不要） ----------
export async function postMessages(body) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
