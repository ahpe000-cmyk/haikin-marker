/**
 * Validates every content JSON file under src/content against the domain
 * schemas, plus structural rules the schemas cannot express alone
 * (STEP coverage, unique IDs, category consistency).
 *
 * Usage: npm run validate:content
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  currentAffairsBatchSchema,
  dailyPollSchema,
  questionListSchema,
} from "../src/lib/domain/schemas";
import type { Category, Question } from "../src/lib/domain/types";

const CONTENT_DIR = join(process.cwd(), "src", "content");

let errorCount = 0;

function fail(file: string, message: string): void {
  errorCount += 1;
  console.error(`✗ ${file}: ${message}`);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function formatZodError(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"} — ${issue.message}`)
    .join("; ");
}

function validateEvergreenFile(fileName: string, category: Category): Question[] {
  const path = join(CONTENT_DIR, fileName);
  if (!existsSync(path)) {
    fail(fileName, "ファイルが存在しません");
    return [];
  }
  const parsed = questionListSchema.safeParse(readJson(path));
  if (!parsed.success) {
    fail(fileName, formatZodError(parsed.error));
    return [];
  }
  const questions = parsed.data;

  if (questions.length < 25) {
    fail(fileName, `問題数が${questions.length}問です(25問以上必要)`);
  }
  for (const q of questions) {
    if (q.category !== category) {
      fail(fileName, `${q.id}: categoryが${q.category}です(${category}であるべき)`);
    }
    if (q.step === undefined) {
      fail(fileName, `${q.id}: 常設問題にはstepが必要です`);
    }
  }
  for (const step of [1, 2, 3, 4, 5]) {
    const count = questions.filter((q) => q.step === step).length;
    if (count < 5) {
      fail(fileName, `STEP ${step}の問題が${count}問です(5問必要)`);
    }
  }
  return questions;
}

function validateCurrentAffairs(): Question[] {
  const dir = join(CONTENT_DIR, "current-affairs");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const questions: Question[] = [];
  for (const file of files) {
    const rel = `current-affairs/${file}`;
    const parsed = currentAffairsBatchSchema.safeParse(readJson(join(dir, file)));
    if (!parsed.success) {
      fail(rel, formatZodError(parsed.error));
      continue;
    }
    const expectedDate = file.replace(/\.json$/, "");
    if (parsed.data.batchDate !== expectedDate) {
      fail(rel, `batchDate(${parsed.data.batchDate})とファイル名が一致しません`);
    }
    for (const q of parsed.data.questions) {
      if (q.category !== "current_affairs") {
        fail(rel, `${q.id}: categoryはcurrent_affairsであるべきです`);
      }
      if (q.step !== undefined) {
        fail(rel, `${q.id}: 時事問題にSTEPは設定できません`);
      }
    }
    questions.push(...parsed.data.questions);
  }
  return questions;
}

function validatePolls(): void {
  const dir = join(CONTENT_DIR, "polls");
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const seenDates = new Set<string>();
  for (const file of files) {
    const rel = `polls/${file}`;
    const parsed = dailyPollSchema.safeParse(readJson(join(dir, file)));
    if (!parsed.success) {
      fail(rel, formatZodError(parsed.error));
      continue;
    }
    const expectedDate = file.replace(/\.json$/, "");
    if (parsed.data.date !== expectedDate) {
      fail(rel, `date(${parsed.data.date})とファイル名が一致しません`);
    }
    if (seenDates.has(parsed.data.date)) {
      fail(rel, `日付${parsed.data.date}のアンケートが重複しています`);
    }
    seenDates.add(parsed.data.date);
  }
}

const allQuestions: Question[] = [
  ...validateEvergreenFile("business-terms.json", "business_terms"),
  ...validateEvergreenFile("judgment.json", "judgment"),
  ...validateEvergreenFile("risk.json", "risk"),
  ...validateCurrentAffairs(),
];

const seenIds = new Set<string>();
for (const q of allQuestions) {
  if (seenIds.has(q.id)) {
    fail("(global)", `問題ID ${q.id} が重複しています`);
  }
  seenIds.add(q.id);
}

validatePolls();

if (errorCount > 0) {
  console.error(`\nコンテンツ検証失敗: ${errorCount}件のエラー`);
  process.exit(1);
}
console.log(`コンテンツ検証OK: 問題${allQuestions.length}問を検証しました`);
