import { describe, it, expect } from "vitest";
import {
  FONT_CATALOG,
  SYSTEM_FONTS,
  ALL_FONT_FAMILIES,
  FONT_CATEGORIES,
} from "./font-catalog";

describe("font-catalog", () => {
  it("has 25 curated Google Fonts", () => {
    expect(FONT_CATALOG).toHaveLength(25);
  });

  it("has 3 system fonts", () => {
    expect(SYSTEM_FONTS).toHaveLength(3);
    expect(SYSTEM_FONTS).toContain("Arial");
    expect(SYSTEM_FONTS).toContain("Helvetica");
    expect(SYSTEM_FONTS).toContain("Georgia");
  });

  it("ALL_FONT_FAMILIES includes both Google and system fonts", () => {
    expect(ALL_FONT_FAMILIES).toHaveLength(FONT_CATALOG.length + SYSTEM_FONTS.length);
    // Check a Google font
    expect(ALL_FONT_FAMILIES).toContain("Inter");
    // Check a system font
    expect(ALL_FONT_FAMILIES).toContain("Arial");
  });

  it("all fonts have valid structure", () => {
    for (const font of FONT_CATALOG) {
      expect(font.family).toBeTruthy();
      expect(font.googleUrl).toBeTruthy();
      expect(font.weights.length).toBeGreaterThan(0);
      expect(["sans", "serif", "display", "handwriting", "mono"]).toContain(
        font.category,
      );
    }
  });

  it("all font families are unique", () => {
    const families = FONT_CATALOG.map((f) => f.family);
    expect(new Set(families).size).toBe(families.length);
  });

  it("system fonts are not duplicated in FONT_CATALOG", () => {
    const googleFamilies = FONT_CATALOG.map((f) => f.family);
    for (const sysFont of SYSTEM_FONTS) {
      expect(googleFamilies).not.toContain(sysFont);
    }
  });

  it("all weights are valid CSS font-weight values", () => {
    const validWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    for (const font of FONT_CATALOG) {
      for (const weight of font.weights) {
        expect(validWeights).toContain(weight);
      }
    }
  });

  it("covers all 5 font categories", () => {
    const categories = new Set(FONT_CATALOG.map((f) => f.category));
    expect(categories).toContain("sans");
    expect(categories).toContain("serif");
    expect(categories).toContain("display");
    expect(categories).toContain("handwriting");
    expect(categories).toContain("mono");
  });

  it("FONT_CATEGORIES has human-readable labels for all categories", () => {
    expect(FONT_CATEGORIES.sans).toBe("Sans-Serif");
    expect(FONT_CATEGORIES.serif).toBe("Serif");
    expect(FONT_CATEGORIES.display).toBe("Display");
    expect(FONT_CATEGORIES.handwriting).toBe("Handwriting");
    expect(FONT_CATEGORIES.mono).toBe("Monospace");
  });

  it("Google URLs do not contain spaces (properly encoded)", () => {
    for (const font of FONT_CATALOG) {
      expect(font.googleUrl).not.toContain(" ");
    }
  });
});
