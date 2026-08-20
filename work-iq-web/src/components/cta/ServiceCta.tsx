"use client";

import { useEffect, useRef } from "react";
import { CTA_COPY, type CtaSelection } from "@/lib/cta/select-cta";
import { track } from "@/lib/analytics/track";

/**
 * At most one contextual service card per result/poll screen.
 * No popups, no forced redirects, no diagnostic claims about the user.
 */
export function ServiceCta({ selection }: { selection: CtaSelection }) {
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      track("cta_impression", { cta: selection.service });
    }
  }, [selection.service]);

  const copy = CTA_COPY[selection.service];
  return (
    <a
      href={selection.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("cta_click", { cta: selection.service })}
      className="block rounded-2xl border border-line bg-surface p-4 transition-colors duration-150 hover:border-accent"
    >
      <p className="text-sm font-bold">{copy.title}</p>
      <p className="mt-1 text-xs text-muted">{copy.body}</p>
      <p className="mt-2 text-xs font-semibold text-accent">
        {selection.service === "honne" ? "HONNE" : "BEFoAF"} をのぞいてみる →
      </p>
    </a>
  );
}
