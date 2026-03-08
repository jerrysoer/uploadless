import { describe, it, expect } from "vitest";
import { CANVAS_PRESETS, DEFAULT_PRESET } from "./canvas-presets";

describe("canvas-presets", () => {
  it("has at least 6 presets", () => {
    expect(CANVAS_PRESETS.length).toBeGreaterThanOrEqual(6);
  });

  it("all presets have valid dimensions", () => {
    for (const preset of CANVAS_PRESETS) {
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.height).toBeGreaterThan(0);
      expect(preset.width).toBeLessThanOrEqual(4096);
      expect(preset.height).toBeLessThanOrEqual(4096);
    }
  });

  it("all presets have unique IDs", () => {
    const ids = CANVAS_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all presets have required fields", () => {
    for (const preset of CANVAS_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.label).toBeTruthy();
      expect(preset.category).toBeTruthy();
      expect(typeof preset.width).toBe("number");
      expect(typeof preset.height).toBe("number");
    }
  });

  it("DEFAULT_PRESET is a valid preset", () => {
    expect(DEFAULT_PRESET).toBeDefined();
    expect(CANVAS_PRESETS).toContain(DEFAULT_PRESET);
    expect(DEFAULT_PRESET.width).toBeGreaterThan(0);
    expect(DEFAULT_PRESET.height).toBeGreaterThan(0);
  });

  it("includes standard social media sizes", () => {
    const ids = CANVAS_PRESETS.map((p) => p.id);
    expect(ids).toContain("ig-post");
    expect(ids).toContain("ig-story");
    expect(ids).toContain("fb-post");
    expect(ids).toContain("x-post");
  });

  it("Instagram Post is 1080×1080", () => {
    const igPost = CANVAS_PRESETS.find((p) => p.id === "ig-post");
    expect(igPost).toBeDefined();
    expect(igPost!.width).toBe(1080);
    expect(igPost!.height).toBe(1080);
  });

  it("Instagram Story is 1080×1920 (9:16 portrait)", () => {
    const igStory = CANVAS_PRESETS.find((p) => p.id === "ig-story");
    expect(igStory).toBeDefined();
    expect(igStory!.width).toBe(1080);
    expect(igStory!.height).toBe(1920);
  });
});
