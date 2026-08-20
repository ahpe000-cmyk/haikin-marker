import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  currentAffairsBatchSchema,
  dailyPollSchema,
  questionListSchema,
} from "@/lib/domain/schemas";
import type {
  CurrentAffairsBatch,
  DailyPoll,
  Question,
} from "@/lib/domain/types";

const CONTENT_DIR = join(process.cwd(), "src", "content");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

let evergreenCache: {
  businessTerms: Question[];
  judgment: Question[];
  risk: Question[];
} | null = null;

export function loadEvergreenQuestions(): {
  businessTerms: Question[];
  judgment: Question[];
  risk: Question[];
} {
  if (evergreenCache) return evergreenCache;
  evergreenCache = {
    businessTerms: questionListSchema.parse(
      readJson(join(CONTENT_DIR, "business-terms.json")),
    ),
    judgment: questionListSchema.parse(
      readJson(join(CONTENT_DIR, "judgment.json")),
    ),
    risk: questionListSchema.parse(readJson(join(CONTENT_DIR, "risk.json"))),
  };
  return evergreenCache;
}

export function loadCurrentAffairsBatches(): CurrentAffairsBatch[] {
  const dir = join(CONTENT_DIR, "current-affairs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => currentAffairsBatchSchema.parse(readJson(join(dir, file))))
    .sort((a, b) => a.batchDate.localeCompare(b.batchDate));
}

export function loadPollForDate(dateKey: string): DailyPoll | null {
  const path = join(CONTENT_DIR, "polls", `${dateKey}.json`);
  if (!existsSync(path)) return null;
  return dailyPollSchema.parse(readJson(path));
}

export function loadAllQuestions(): Question[] {
  const evergreen = loadEvergreenQuestions();
  const currentAffairs = loadCurrentAffairsBatches().flatMap(
    (batch) => batch.questions,
  );
  return [
    ...evergreen.businessTerms,
    ...evergreen.judgment,
    ...evergreen.risk,
    ...currentAffairs,
  ];
}
