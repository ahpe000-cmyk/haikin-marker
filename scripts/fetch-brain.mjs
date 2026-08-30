// Notion「AHPE共有ボード」を取得して brain.json を生成する（GitHub Actionsから実行）
// 環境変数:
//   NOTION_TOKEN   … Notionインテグレーションのトークン（必須。無ければスキップして正常終了）
//   NOTION_PAGE_ID … 共有ボードのページID（任意。無ければタイトル検索で探す）
// 使い方: node scripts/fetch-brain.mjs <出力先パス>

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const TOKEN = process.env.NOTION_TOKEN || "";
const PAGE_ID = process.env.NOTION_PAGE_ID || "";
const PAGE_TITLE = "AHPE共有ボード";
const OUT = process.argv[2] || "brain.json";
const MAX_DEPTH = 4;

if (!TOKEN) {
  console.log("NOTION_TOKEN が未設定のため brain.json の生成をスキップします");
  process.exit(0);
}

async function notion(path, options = {}) {
  const res = await fetch("https://api.notion.com/v1" + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + TOKEN,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Notion API " + res.status + ": " + (data.message || path));
  return data;
}

const rt = (arr) => (arr || []).map((t) => t.plain_text).join("");

async function findPageId() {
  const data = await notion("/search", {
    method: "POST",
    body: JSON.stringify({ query: PAGE_TITLE, filter: { value: "page", property: "object" }, page_size: 10 }),
  });
  for (const r of data.results || []) {
    const titleProp = Object.values(r.properties || {}).find((p) => p.type === "title");
    const title = titleProp ? rt(titleProp.title) : "";
    if (title.includes(PAGE_TITLE)) return r.id;
  }
  throw new Error("ページ「" + PAGE_TITLE + "」が見つかりません。インテグレーションがページに接続されているか確認してください。");
}

async function listChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const q = "?page_size=100" + (cursor ? "&start_cursor=" + cursor : "");
    const data = await notion("/blocks/" + blockId + "/children" + q);
    blocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return blocks;
}

// データベースの行を「プロパティ名: 値」の1行テキストに変換
function propText(prop) {
  switch (prop.type) {
    case "title": return rt(prop.title);
    case "rich_text": return rt(prop.rich_text);
    case "number": return prop.number == null ? "" : String(prop.number);
    case "select": return prop.select ? prop.select.name : "";
    case "status": return prop.status ? prop.status.name : "";
    case "multi_select": return (prop.multi_select || []).map((s) => s.name).join(",");
    case "date": return prop.date ? prop.date.start + (prop.date.end ? "→" + prop.date.end : "") : "";
    case "checkbox": return prop.checkbox ? "✓" : "✗";
    case "url": return prop.url || "";
    case "email": return prop.email || "";
    case "phone_number": return prop.phone_number || "";
    case "people": return (prop.people || []).map((p) => p.name || "").join(",");
    case "formula": {
      const f = prop.formula;
      return f ? String(f[f.type] ?? "") : "";
    }
    default: return "";
  }
}

async function renderDatabase(dbId, depth) {
  const indent = "　".repeat(Math.min(depth, 3));
  const lines = [];
  let cursor;
  try {
    do {
      const data = await notion("/databases/" + dbId + "/query", {
        method: "POST",
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      });
      for (const row of data.results || []) {
        const cells = Object.entries(row.properties || {})
          .map(([name, p]) => {
            const v = propText(p);
            return v ? name + ": " + v : "";
          })
          .filter(Boolean);
        if (cells.length) lines.push(indent + "・" + cells.join(" ／ "));
      }
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
  } catch (e) {
    lines.push(indent + "（データベース読み取り不可: " + e.message + "）");
  }
  return lines;
}

async function renderBlocks(blockId, depth = 0) {
  const lines = [];
  const indent = "　".repeat(Math.min(depth, 3));
  for (const b of await listChildren(blockId)) {
    const t = b.type;
    const d = b[t] || {};
    let line = "";
    switch (t) {
      case "heading_1": line = "# " + rt(d.rich_text); break;
      case "heading_2": line = "## " + rt(d.rich_text); break;
      case "heading_3": line = "### " + rt(d.rich_text); break;
      case "paragraph": line = rt(d.rich_text); break;
      case "bulleted_list_item": line = "・" + rt(d.rich_text); break;
      case "numbered_list_item": line = "- " + rt(d.rich_text); break;
      case "to_do": line = (d.checked ? "[x] " : "[ ] ") + rt(d.rich_text); break;
      case "toggle": line = "▸ " + rt(d.rich_text); break;
      case "quote": line = "> " + rt(d.rich_text); break;
      case "callout": line = "※ " + rt(d.rich_text); break;
      case "code": line = rt(d.rich_text); break;
      case "divider": line = "――――――――"; break;
      case "table_row": line = (d.cells || []).map((c) => rt(c)).join(" | "); break;
      case "child_page": line = "📄 " + (d.title || ""); break;
      case "child_database": line = "🗄 " + (d.title || ""); break;
      default: line = d.rich_text ? rt(d.rich_text) : "";
    }
    if (line) lines.push(indent + line);
    if (t === "child_database") {
      lines.push(...(await renderDatabase(b.id, depth + 1)));
    } else if (b.has_children && depth < MAX_DEPTH && t !== "child_page") {
      lines.push(...(await renderBlocks(b.id, depth + 1)));
    }
  }
  return lines;
}

const pageId = PAGE_ID || (await findPageId());
console.log("共有ボードを取得中: " + pageId);
const lines = await renderBlocks(pageId);
const content = lines.join("\n").trim();
if (!content) throw new Error("ページ内容が空でした");

const updatedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ content, updatedAt }), "utf8");
console.log("生成完了: " + OUT + "（" + content.length + "文字 / " + updatedAt + "）");
