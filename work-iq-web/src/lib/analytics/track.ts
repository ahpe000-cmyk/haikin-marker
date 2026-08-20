import { getOrCreateAnonId } from "@/lib/storage/local-progress";

/** Exact allowlist of anonymous product events from the design spec. */
export const ALLOWED_EVENTS = [
  "landing_view",
  "daily_quiz_start",
  "quiz_start",
  "question_answered",
  "quiz_complete",
  "result_view",
  "share_click",
  "share_success",
  "poll_view",
  "poll_vote",
  "review_start",
  "review_complete",
  "learn_category_view",
  "cta_impression",
  "cta_click",
] as const;

export type EventName = (typeof ALLOWED_EVENTS)[number];

export interface EventProperties {
  category?: string;
  step?: number;
  questionId?: string;
  sessionId?: string;
  cta?: string;
}

/**
 * Fire-and-forget anonymous product event. Sends only allowlisted names and
 * structured fields — never free text, email, or profile data. Failures are
 * silent: analytics must never break the product.
 */
export function track(event: EventName, properties: EventProperties = {}): void {
  if (typeof window === "undefined") return;
  if (!ALLOWED_EVENTS.includes(event)) return;

  const payload = JSON.stringify({
    anonId: getOrCreateAnonId(),
    event,
    route: window.location.pathname,
    category: properties.category,
    step: properties.step,
    questionId: properties.questionId,
    sessionId: properties.sessionId,
    cta: properties.cta,
    clientTimestamp: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let analytics interfere with the user experience.
  }
}
