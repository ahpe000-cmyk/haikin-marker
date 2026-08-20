import { describe, expect, it } from "vitest";
import {
  MAX_ANSWERS_PER_CATEGORY,
  boundProgress,
  createInitialProgress,
  getOrCreateAnonId,
  loadProgress,
  saveProgress,
  type StoredAnswerRecord,
} from "./local-progress";

const STORAGE_KEY = "work-iq-progress-v1";

describe("local progress", () => {
  it("creates a fresh state on first run", () => {
    const state = loadProgress();
    expect(state.version).toBe(1);
    expect(state.anonId.length).toBeGreaterThan(0);
    expect(state.stepUnlocks).toEqual({
      business_terms: 1,
      judgment: 1,
      risk: 1,
    });
    expect(state.sessions).toEqual([]);
    expect(state.streak).toEqual({ current: 0, lastDateKey: null });
  });

  it("round-trips through localStorage", () => {
    const state = createInitialProgress();
    state.streak = { current: 3, lastDateKey: "2026-08-21" };
    state.stepUnlocks.judgment = 2;
    saveProgress(state);

    const reloaded = loadProgress();
    expect(reloaded.anonId).toBe(state.anonId);
    expect(reloaded.streak).toEqual({ current: 3, lastDateKey: "2026-08-21" });
    expect(reloaded.stepUnlocks.judgment).toBe(2);
  });

  it("recovers safely from malformed JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json!!");
    const state = loadProgress();
    expect(state.version).toBe(1);
    expect(state.sessions).toEqual([]);
  });

  it("recovers safely from a wrong shape", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }));
    const state = loadProgress();
    expect(state.version).toBe(1);
  });

  it("keeps a stable anon id across calls", () => {
    const first = getOrCreateAnonId();
    const second = getOrCreateAnonId();
    expect(second).toBe(first);
  });

  it("never collects email or name fields", () => {
    const state = createInitialProgress();
    const serialized = JSON.stringify(state);
    expect(serialized).not.toContain("email");
    expect(serialized).not.toContain("name");
  });

  it("bounds per-category answer history", () => {
    const state = createInitialProgress();
    const records: StoredAnswerRecord[] = [];
    for (let i = 0; i < MAX_ANSWERS_PER_CATEGORY + 20; i += 1) {
      records.push({
        questionId: `bt-${i}`,
        category: "business_terms",
        isCorrect: true,
        weight: 1,
        dateKey: "2026-08-21",
      });
    }
    state.answerHistory = records;
    const bounded = boundProgress(state);
    expect(bounded.answerHistory).toHaveLength(MAX_ANSWERS_PER_CATEGORY);
    expect(bounded.answerHistory[0].questionId).toBe("bt-20");
  });
});
