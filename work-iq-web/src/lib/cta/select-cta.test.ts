import { describe, expect, it } from "vitest";
import { selectCta } from "./select-cta";

const env = {
  honneUrl: "https://honne.example.com",
  befoafUrl: "https://befoaf.example.com",
};

describe("selectCta", () => {
  it("selects HONNE after judgment and risk results", () => {
    expect(selectCta({ surface: "result", category: "judgment" }, env)).toEqual(
      { service: "honne", url: env.honneUrl },
    );
    expect(selectCta({ surface: "result", category: "risk" }, env)).toEqual({
      service: "honne",
      url: env.honneUrl,
    });
  });

  it("shows no CTA after business-terms or current-affairs results", () => {
    expect(
      selectCta({ surface: "result", category: "business_terms" }, env),
    ).toBeNull();
    expect(
      selectCta({ surface: "result", category: "current_affairs" }, env),
    ).toBeNull();
  });

  it("selects BEFoAF only for communication/relationship/social poll tags", () => {
    expect(
      selectCta({ surface: "poll", pollTags: ["communication"] }, env),
    ).toEqual({ service: "befoaf", url: env.befoafUrl });
    expect(
      selectCta({ surface: "poll", pollTags: ["relationship"] }, env),
    ).toEqual({ service: "befoaf", url: env.befoafUrl });
    expect(selectCta({ surface: "poll", pollTags: ["social"] }, env)).toEqual({
      service: "befoaf",
      url: env.befoafUrl,
    });
    expect(
      selectCta({ surface: "poll", pollTags: ["career"] }, env),
    ).toBeNull();
  });

  it("hides the CTA entirely when the URL is missing", () => {
    expect(
      selectCta({ surface: "result", category: "judgment" }, {}),
    ).toBeNull();
    expect(
      selectCta(
        { surface: "poll", pollTags: ["communication"] },
        { honneUrl: "https://honne.example.com" },
      ),
    ).toBeNull();
  });

  it("returns at most one CTA per surface", () => {
    const selection = selectCta(
      { surface: "poll", pollTags: ["communication", "social"] },
      env,
    );
    expect(selection).toEqual({ service: "befoaf", url: env.befoafUrl });
  });
});
