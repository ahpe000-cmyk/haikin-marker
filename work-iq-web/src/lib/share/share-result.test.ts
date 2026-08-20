import { describe, expect, it, vi } from "vitest";
import { buildShareText, shareResult } from "./share-result";

describe("buildShareText", () => {
  it("contains the score and never a percentile or rank", () => {
    const text = buildShareText(82, "work_iq");
    expect(text).toBe(
      "WORK IQ 82。今日の5問に挑戦しました。あなたの社会人力は何点？",
    );
    expect(text).not.toMatch(/上位|全国|%|位/);
  });

  it("avoids the WORK IQ label while still provisional", () => {
    const text = buildShareText(60, "provisional");
    expect(text).toContain("今日のスコア 60");
    expect(text).not.toContain("WORK IQ 60");
  });
});

describe("shareResult", () => {
  const data = { text: "テキスト", url: "https://example.com/result/x" };

  it("uses the Web Share API when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const copy = vi.fn();
    const outcome = await shareResult(data, { canShare: true, share, copy });
    expect(outcome).toBe("shared");
    expect(share).toHaveBeenCalledWith(data);
    expect(copy).not.toHaveBeenCalled();
  });

  it("falls back to the clipboard when share is unavailable", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    const outcome = await shareResult(data, { canShare: false, copy });
    expect(outcome).toBe("copied");
    expect(copy).toHaveBeenCalledWith(`${data.text} ${data.url}`);
  });

  it("falls back to the clipboard when share throws a non-abort error", async () => {
    const share = vi.fn().mockRejectedValue(new Error("boom"));
    const copy = vi.fn().mockResolvedValue(undefined);
    const outcome = await shareResult(data, { canShare: true, share, copy });
    expect(outcome).toBe("copied");
  });

  it("reports failure when the user cancels the share sheet", async () => {
    const abort = new Error("cancelled");
    abort.name = "AbortError";
    const share = vi.fn().mockRejectedValue(abort);
    const copy = vi.fn();
    const outcome = await shareResult(data, { canShare: true, share, copy });
    expect(outcome).toBe("failed");
    expect(copy).not.toHaveBeenCalled();
  });

  it("reports failure when the clipboard is unavailable", async () => {
    const copy = vi.fn().mockRejectedValue(new Error("denied"));
    const outcome = await shareResult(data, { canShare: false, copy });
    expect(outcome).toBe("failed");
  });
});
