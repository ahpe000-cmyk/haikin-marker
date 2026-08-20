import type { Category, Question, Step } from "@/lib/domain/types";

export interface DailySelectionInput {
  businessTerms: Question[];
  judgment: Question[];
  risk: Question[];
  /** Fresh current-affairs questions only; may be empty. */
  currentAffairs: Question[];
  /** IDs answered within the previous 7 days, to avoid repeats. */
  recentQuestionIds: string[];
  /** Seed for deterministic selection (e.g. anonId + JST date). */
  seed: string;
}

/** Deterministic PRNG (mulberry32) seeded from a string. */
export function createSeededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom(
  pool: Question[],
  count: number,
  recentIds: Set<string>,
  exclude: Set<string>,
  random: () => number,
): Question[] {
  const notExcluded = pool.filter((q) => !exclude.has(q.id));
  // Avoid 7-day repeats only when the pool still has enough fresh questions.
  const preferred = notExcluded.filter((q) => !recentIds.has(q.id));
  const candidates = preferred.length >= count ? preferred : notExcluded;

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * Daily 5-question mix: 2 business terms, 1 judgment, 1 risk,
 * 1 fresh current affairs. Without fresh current affairs, the fifth
 * question comes from judgment or risk instead.
 */
export function selectDailyQuestions(input: DailySelectionInput): Question[] {
  const random = createSeededRandom(input.seed);
  const recentIds = new Set(input.recentQuestionIds);
  const chosen: Question[] = [];
  const chosenIds = new Set<string>();

  const take = (pool: Question[], count: number) => {
    const picked = pickRandom(pool, count, recentIds, chosenIds, random);
    for (const q of picked) {
      chosen.push(q);
      chosenIds.add(q.id);
    }
  };

  take(input.businessTerms, 2);
  take(input.judgment, 1);
  take(input.risk, 1);

  if (input.currentAffairs.length > 0) {
    take(input.currentAffairs, 1);
  } else {
    // Fallback: one extra judgment or risk question, chosen deterministically.
    const fallbackPool = random() < 0.5 ? input.judgment : input.risk;
    take(fallbackPool, 1);
    if (chosen.length < 5) {
      take(
        fallbackPool === input.judgment ? input.risk : input.judgment,
        5 - chosen.length,
      );
    }
  }

  return chosen;
}

/** Fixed questions for one STEP, in stable ID order. */
export function getStepQuestions(
  pool: Question[],
  category: Category,
  step: Step,
): Question[] {
  return pool
    .filter((q) => q.category === category && q.step === step)
    .sort((a, b) => a.id.localeCompare(b.id));
}
