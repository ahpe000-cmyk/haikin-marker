import type { ScoreState } from "@/lib/scoring/work-iq";

/**
 * Share text contains the session score only — never a rank, percentile,
 * or participant count.
 */
export function buildShareText(score: number, scoreState: ScoreState): string {
  const scoreLabel =
    scoreState === "work_iq" ? `WORK IQ ${score}` : `今日のスコア ${score}`;
  return `${scoreLabel}。今日の5問に挑戦しました。あなたの社会人力は何点？`;
}

export type ShareOutcome = "shared" | "copied" | "failed";

export interface ShareAdapter {
  canShare: boolean;
  share?: (data: { text: string; url: string }) => Promise<void>;
  copy: (text: string) => Promise<void>;
}

function defaultAdapter(): ShareAdapter {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  return {
    canShare: typeof nav?.share === "function",
    share: nav?.share ? (data) => nav.share(data) : undefined,
    copy: (text) => {
      if (!nav?.clipboard) return Promise.reject(new Error("no clipboard"));
      return nav.clipboard.writeText(text);
    },
  };
}

/**
 * Web Share API on supporting browsers, clipboard fallback otherwise.
 */
export async function shareResult(
  data: { text: string; url: string },
  adapter: ShareAdapter = defaultAdapter(),
): Promise<ShareOutcome> {
  if (adapter.canShare && adapter.share) {
    try {
      await adapter.share(data);
      return "shared";
    } catch (error) {
      // AbortError = user cancelled the sheet; treat as a silent no-op fail.
      if (error instanceof Error && error.name === "AbortError") {
        return "failed";
      }
      // Fall through to the clipboard.
    }
  }
  try {
    await adapter.copy(`${data.text} ${data.url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
