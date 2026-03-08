import { describe, it, expect } from "vitest";
import {
  MODEL_PACKS,
  getModelPack,
  getPackByModelId,
  canUseFeature,
  getBestModelForCapability,
  getRequiredModelLabel,
  type ModelCapability,
  type ModelSlug,
} from "./registry";

// ── Model pack structure ──────────────────────────────────────────────

describe("MODEL_PACKS", () => {
  it("has 5 model packs", () => {
    expect(MODEL_PACKS).toHaveLength(5);
  });

  it("slugs are tiny, balanced, general, code, reasoning", () => {
    expect(MODEL_PACKS.map((p) => p.slug)).toEqual([
      "tiny",
      "balanced",
      "general",
      "code",
      "reasoning",
    ]);
  });

  it("every pack has required fields", () => {
    for (const pack of MODEL_PACKS) {
      expect(pack.slug).toBeTruthy();
      expect(pack.model).toBeTruthy();
      expect(pack.name).toBeTruthy();
      expect(pack.icon).toBeTruthy();
      expect(pack.sizeLabel).toBeTruthy();
      expect(pack.sizeBytes).toBeGreaterThan(0);
      expect(pack.vramLabel).toBeTruthy();
      expect(pack.capabilities.length).toBeGreaterThan(0);
      expect(pack.provider).toBe("webllm");
    }
  });

  it("general is marked as recommended", () => {
    const general = MODEL_PACKS.find((p) => p.slug === "general");
    expect(general?.recommended).toBe(true);
  });

  it("only general is recommended", () => {
    const recommended = MODEL_PACKS.filter((p) => p.recommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0].slug).toBe("general");
  });
});

// ── Lookup functions ──────────────────────────────────────────────────

describe("getModelPack", () => {
  it("returns correct pack for each slug", () => {
    const slugs: ModelSlug[] = ["tiny", "balanced", "general", "code", "reasoning"];
    for (const slug of slugs) {
      const pack = getModelPack(slug);
      expect(pack).toBeDefined();
      expect(pack!.slug).toBe(slug);
    }
  });

  it("returns undefined for unknown slug", () => {
    expect(getModelPack("nonexistent" as ModelSlug)).toBeUndefined();
  });
});

describe("getPackByModelId", () => {
  it("finds pack by WebLLM model string", () => {
    const pack = getPackByModelId("Qwen2.5-3B-Instruct-q4f16_1-MLC");
    expect(pack).toBeDefined();
    expect(pack!.slug).toBe("general");
  });

  it("returns undefined for unknown model ID", () => {
    expect(getPackByModelId("GPT-4o-mini")).toBeUndefined();
  });
});

// ── canUseFeature ────────────────────────────────────────────────────

describe("canUseFeature", () => {
  it("returns false when activeSlug is null", () => {
    expect(canUseFeature("classification", null)).toBe(false);
  });

  it("tiny model supports classification", () => {
    expect(canUseFeature("classification", "tiny")).toBe(true);
  });

  it("tiny model does NOT support email_compose", () => {
    expect(canUseFeature("email_compose", "tiny")).toBe(false);
  });

  it("balanced model supports rewrite", () => {
    expect(canUseFeature("rewrite", "balanced")).toBe(true);
  });

  it("code model supports commit_message", () => {
    expect(canUseFeature("commit_message", "code")).toBe(true);
  });

  it("reasoning model supports threat_model", () => {
    expect(canUseFeature("threat_model", "reasoning")).toBe(true);
  });
});

// ── Capability tier hierarchy ─────────────────────────────────────────

describe("Capability tiers", () => {
  const tier1: ModelCapability[] = ["classification", "sentiment", "keywords"];

  const tier2Only: ModelCapability[] = [
    "rewrite",
    "summarize_short",
    "summarize_medium",
    "audit_explain",
    "json_explain",
    "regex_explain",
    "email_compose",
    "social_post",
  ];

  const tier3Only: ModelCapability[] = [
    "extract_json",
    "receipt_parse",
    "contract_analyze",
    "privacy_policy",
    "meeting_minutes",
    "translate",
    "job_analyze",
  ];

  it("tiny supports all tier 1 capabilities", () => {
    for (const cap of tier1) {
      expect(canUseFeature(cap, "tiny"), `tiny should support ${cap}`).toBe(true);
    }
  });

  it("tiny does NOT support tier 2 capabilities", () => {
    for (const cap of tier2Only) {
      expect(canUseFeature(cap, "tiny"), `tiny should not support ${cap}`).toBe(false);
    }
  });

  it("balanced supports tier 1 + tier 2", () => {
    for (const cap of [...tier1, ...tier2Only]) {
      expect(canUseFeature(cap, "balanced"), `balanced should support ${cap}`).toBe(true);
    }
  });

  it("general supports tier 1 + 2 + 3", () => {
    for (const cap of [...tier1, ...tier2Only, ...tier3Only]) {
      expect(canUseFeature(cap, "general"), `general should support ${cap}`).toBe(true);
    }
  });

  it("code model inherits tier 3 and adds code capabilities", () => {
    const codeCaps: ModelCapability[] = [
      "commit_message",
      "code_review",
      "code_explain",
      "error_decode",
      "pr_description",
    ];
    for (const cap of codeCaps) {
      expect(canUseFeature(cap, "code"), `code should support ${cap}`).toBe(true);
    }
  });

  it("reasoning model adds swot and threat_model", () => {
    expect(canUseFeature("swot", "reasoning")).toBe(true);
    expect(canUseFeature("threat_model", "reasoning")).toBe(true);
  });
});

// ── Removed capabilities ──────────────────────────────────────────────

describe("Removed capabilities no longer exist", () => {
  const removedCaps = ["sql_generate", "test_generate", "readme_generate", "full_review"];

  it("removed capabilities are not in any model pack", () => {
    for (const pack of MODEL_PACKS) {
      for (const removed of removedCaps) {
        expect(
          pack.capabilities.includes(removed as ModelCapability),
          `${pack.slug} should not have ${removed}`,
        ).toBe(false);
      }
    }
  });
});

// ── getBestModelForCapability ─────────────────────────────────────────

describe("getBestModelForCapability", () => {
  it("returns tiny for classification (smallest model)", () => {
    const best = getBestModelForCapability("classification");
    expect(best?.slug).toBe("tiny");
  });

  it("returns balanced for email_compose", () => {
    const best = getBestModelForCapability("email_compose");
    expect(best?.slug).toBe("balanced");
  });

  it("returns general for extract_json", () => {
    const best = getBestModelForCapability("extract_json");
    expect(best?.slug).toBe("general");
  });

  it("returns code for commit_message", () => {
    const best = getBestModelForCapability("commit_message");
    expect(best?.slug).toBe("code");
  });

  it("returns reasoning for swot", () => {
    const best = getBestModelForCapability("swot");
    expect(best?.slug).toBe("reasoning");
  });
});

// ── getRequiredModelLabel ─────────────────────────────────────────────

describe("getRequiredModelLabel", () => {
  it("returns human-readable model name", () => {
    expect(getRequiredModelLabel("classification")).toBe("Tiny (Fast)");
    expect(getRequiredModelLabel("email_compose")).toBe("Balanced");
    expect(getRequiredModelLabel("extract_json")).toBe("General (Recommended)");
    expect(getRequiredModelLabel("commit_message")).toBe("Code");
    expect(getRequiredModelLabel("swot")).toBe("Reasoning");
  });
});
