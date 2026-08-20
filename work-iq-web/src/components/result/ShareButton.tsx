"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildShareText, shareResult } from "@/lib/share/share-result";
import type { ScoreState } from "@/lib/scoring/work-iq";
import { track } from "@/lib/analytics/track";

export function ShareButton({
  score,
  scoreState,
  sessionId,
}: {
  score: number;
  scoreState: ScoreState;
  sessionId: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    track("share_click", { sessionId });
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/result/${sessionId}`
        : `/result/${sessionId}`;
    const outcome = await shareResult({
      text: buildShareText(score, scoreState),
      url,
    });
    if (outcome === "copied") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
    if (outcome === "shared" || outcome === "copied") {
      track("share_success", { sessionId });
    }
  };

  return (
    <div>
      <Button onClick={handleShare} variant="secondary" className="w-full">
        結果をシェア
      </Button>
      <p aria-live="polite" className="mt-1 text-center text-xs text-success">
        {copied ? "シェア用テキストをコピーしました" : " "}
      </p>
    </div>
  );
}
