import type { Category } from "@/lib/domain/types";

export type CtaService = "honne" | "befoaf";

export interface CtaContext {
  surface: "result" | "poll";
  /** Dominant category of the finished quiz session, for result surfaces. */
  category?: Category;
  /** Tags of the answered poll, for poll surfaces. */
  pollTags?: string[];
}

export interface CtaEnv {
  honneUrl?: string;
  befoafUrl?: string;
}

export interface CtaSelection {
  service: CtaService;
  url: string;
}

const BEFOAF_TAGS = new Set(["communication", "relationship", "social"]);

function defaultEnv(): CtaEnv {
  return {
    honneUrl: process.env.NEXT_PUBLIC_HONNE_URL,
    befoafUrl: process.env.NEXT_PUBLIC_BEFOAF_URL,
  };
}

/**
 * Context rule from the design spec: at most one service CTA per
 * result/poll screen; HONNE after judgment/risk results; BEFoAF after
 * polls tagged communication/relationship/social. A missing URL hides
 * the CTA entirely — no guessed destinations.
 */
export function selectCta(
  context: CtaContext,
  env: CtaEnv = defaultEnv(),
): CtaSelection | null {
  if (context.surface === "result") {
    const relevant =
      context.category === "judgment" || context.category === "risk";
    if (relevant && env.honneUrl) {
      return { service: "honne", url: env.honneUrl };
    }
    return null;
  }

  const tags = context.pollTags ?? [];
  if (tags.some((tag) => BEFOAF_TAGS.has(tag)) && env.befoafUrl) {
    return { service: "befoaf", url: env.befoafUrl };
  }
  return null;
}

export const CTA_COPY: Record<CtaService, { title: string; body: string }> = {
  honne: {
    title: "仕事のことを、第三者と整理してみる",
    body: "モヤモヤした判断や職場の悩みは、外の視点で整理すると早く進みます。",
  },
  befoaf: {
    title: "リアルなコミュニケーションを楽しむ",
    body: "オンラインの先にある、リアルな会話の場をのぞいてみませんか。",
  },
};
