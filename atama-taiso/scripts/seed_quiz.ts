/**
 * クイズ問題プールの一括投入スクリプト（CLAUDE.md §9）
 *
 * 使い方:
 *   cd atama-taiso
 *   npm run seed:quiz -- data/quiz_sample.csv
 *
 * 必要な環境変数（.env.local に置くか、シェルで設定）:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← サーバー専用。コミットしない
 *
 * CSVの列: category,question,choice1,choice2,choice3,choice4,answer_index,explanation,difficulty
 * 人の目でチェック済みのCSVだけを渡すこと。投入時に approved = true になる。
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// .env.local があれば読み込む（値はログに出さない）
function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// 引用符つきCSVに対応した簡易パーサ
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((c) => c !== "")) rows.push(row);
  }
  return rows;
}

const VALID_CATEGORIES = new Set([
  "math",
  "history",
  "geography",
  "heritage",
  "general",
]);

async function main() {
  loadEnvLocal();
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("使い方: npm run seed:quiz -- <CSVファイル>");
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください"
    );
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(resolve(csvPath), "utf8"));
  const header = rows.shift();
  if (
    !header ||
    header.join(",") !==
      "category,question,choice1,choice2,choice3,choice4,answer_index,explanation,difficulty"
  ) {
    console.error("CSVのヘッダー行が想定と違います");
    process.exit(1);
  }

  const records = rows.map((r, i) => {
    const [category, question, c1, c2, c3, c4, answerIndex, explanation, difficulty] = r;
    if (!VALID_CATEGORIES.has(category)) {
      throw new Error(`${i + 2}行目: category が不正です: ${category}`);
    }
    const ai = Number(answerIndex);
    if (!Number.isInteger(ai) || ai < 0 || ai > 3) {
      throw new Error(`${i + 2}行目: answer_index は 0〜3 にしてください`);
    }
    if (![c1, c2, c3, c4, question].every((s) => s && s.trim())) {
      throw new Error(`${i + 2}行目: 問題文と選択肢4つは必須です`);
    }
    return {
      category,
      question: question.trim(),
      choices: [c1, c2, c3, c4].map((s) => s.trim()),
      answer_index: ai,
      explanation: explanation?.trim() || null,
      difficulty: Number(difficulty) || 1,
      approved: true, // 人が確認済みのCSVのみ投入する運用（§9）
    };
  });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error, count } = await supabase
    .from("quiz_questions")
    .insert(records, { count: "exact" });
  if (error) {
    console.error("投入に失敗しました:", error.message);
    process.exit(1);
  }
  console.log(`${count ?? records.length}問を投入しました（approved = true）`);
}

main();
