/** Model registry — 5 packs with capability arrays for feature gating */

export type ModelSlug = "tiny" | "balanced" | "general" | "code" | "reasoning";

export type ModelCapability =
  | "classification"
  | "sentiment"
  | "keywords"
  | "rewrite"
  | "summarize_short"
  | "summarize_medium"
  | "audit_explain"
  | "json_explain"
  | "regex_explain"
  | "extract_json"
  | "email_compose"
  | "contract_analyze"
  | "receipt_parse"
  | "privacy_policy"
  | "social_post"
  | "meeting_minutes"
  | "commit_message"
  | "translate"
  | "code_review"
  | "code_explain"
  | "sql_generate"
  | "test_generate"
  | "error_decode"
  | "swot"
  | "threat_model"
  | "long_doc"
  | "full_review"
  | "tech_writing"
  | "pr_description"
  | "readme_generate"
  | "job_analyze";

export interface ModelPack {
  slug: ModelSlug;
  model: string;
  name: string;
  icon: string;
  sizeLabel: string;
  sizeBytes: number;
  vramLabel: string;
  capabilities: ModelCapability[];
  recommended?: boolean;
  provider: "webllm";
}

/** Tier 1 capabilities — fast classification and short generation */
const TIER_1_CAPS: ModelCapability[] = [
  "classification",
  "sentiment",
  "keywords",
];

/** Tier 2 capabilities — rewriting and summarization */
const TIER_2_CAPS: ModelCapability[] = [
  ...TIER_1_CAPS,
  "rewrite",
  "summarize_short",
  "summarize_medium",
  "audit_explain",
  "json_explain",
  "regex_explain",
  "email_compose",
  "social_post",
];

/** Tier 3 capabilities — structured extraction and analysis */
const TIER_3_CAPS: ModelCapability[] = [
  ...TIER_2_CAPS,
  "extract_json",
  "receipt_parse",
  "contract_analyze",
  "privacy_policy",
  "meeting_minutes",
  "translate",
  "job_analyze",
];

export const MODEL_PACKS: ModelPack[] = [
  {
    slug: "tiny",
    model: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    name: "Tiny (Fast)",
    icon: "\u26A1",
    sizeLabel: "~400 MB",
    sizeBytes: 400_000_000,
    vramLabel: "~1 GB",
    capabilities: TIER_1_CAPS,
    provider: "webllm",
  },
  {
    slug: "balanced",
    model: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Balanced",
    icon: "\u2696\uFE0F",
    sizeLabel: "~900 MB",
    sizeBytes: 900_000_000,
    vramLabel: "~2 GB",
    capabilities: TIER_2_CAPS,
    provider: "webllm",
  },
  {
    slug: "general",
    model: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    name: "General (Recommended)",
    icon: "\uD83E\uDDE0",
    sizeLabel: "~1.8 GB",
    sizeBytes: 1_800_000_000,
    vramLabel: "~3 GB",
    capabilities: TIER_3_CAPS,
    recommended: true,
    provider: "webllm",
  },
  {
    slug: "code",
    model: "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
    name: "Code",
    icon: "\uD83D\uDCBB",
    sizeLabel: "~1.8 GB",
    sizeBytes: 1_800_000_000,
    vramLabel: "~3 GB",
    capabilities: [
      ...TIER_3_CAPS,
      "commit_message",
      "code_review",
      "code_explain",
      "sql_generate",
      "test_generate",
      "error_decode",
      "pr_description",
      "readme_generate",
    ],
    provider: "webllm",
  },
  {
    slug: "reasoning",
    model: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Reasoning",
    icon: "\uD83D\uDD2C",
    sizeLabel: "~2.2 GB",
    sizeBytes: 2_200_000_000,
    vramLabel: "~4 GB",
    capabilities: [
      ...TIER_3_CAPS,
      "swot",
      "threat_model",
    ],
    provider: "webllm",
  },
];

/** Lookup a model pack by slug */
export function getModelPack(slug: ModelSlug): ModelPack | undefined {
  return MODEL_PACKS.find((p) => p.slug === slug);
}

/** Lookup a model pack by WebLLM model ID */
export function getPackByModelId(modelId: string): ModelPack | undefined {
  return MODEL_PACKS.find((p) => p.model === modelId);
}

/** Check if a given model slug supports a capability */
export function canUseFeature(
  capability: ModelCapability,
  activeSlug: ModelSlug | null,
): boolean {
  if (!activeSlug) return false;
  const pack = getModelPack(activeSlug);
  return pack?.capabilities.includes(capability) ?? false;
}

/** Get the best (smallest) model pack that supports a given capability */
export function getBestModelForCapability(
  capability: ModelCapability,
): ModelPack | undefined {
  return MODEL_PACKS.find((p) => p.capabilities.includes(capability));
}

/** Get a human-readable label for what model tier a capability requires */
export function getRequiredModelLabel(capability: ModelCapability): string {
  const pack = getBestModelForCapability(capability);
  return pack ? pack.name : "Unknown";
}

// ─── Tab AI Coverage ───────────────────────────────────────────────────

interface ToolWithAI {
  ai?: { tier: string; capability?: ModelCapability };
}

export interface TabAICoverage {
  /** Total AI tools in this tab */
  totalAI: number;
  /** Tools compatible with the active model */
  supported: number;
  /** Tools not compatible with the active model */
  unsupported: number;
  /** Tools that require Ollama (not available in WebLLM) */
  ollamaOnly: number;
  /** Tools that use specialized models (Whisper, Tesseract, etc.) */
  specializedOnly: number;
  /** Best WebLLM model slug for this tab's tools */
  bestSlug: ModelSlug | null;
  /** How many tools the best model would cover */
  bestCoverage: number;
}

/** Compute AI coverage for a set of tools given the active model slug */
export function getTabAICoverage(
  tools: ToolWithAI[],
  activeSlug: ModelSlug | null,
): TabAICoverage {
  const aiTools = tools.filter((t) => t.ai);
  const ollamaOnly = aiTools.filter((t) => t.ai?.tier === "Ollama").length;
  const specializedOnly = aiTools.filter(
    (t) => t.ai?.tier === "Specialized" || t.ai?.tier === "AI",
  ).length;

  // Count supported tools (those with a capability the active model handles)
  const supported = activeSlug
    ? aiTools.filter((t) => {
        if (!t.ai?.capability) return false;
        return canUseFeature(t.ai.capability, activeSlug);
      }).length
    : 0;

  // Find the best WebLLM model for this tab's tools
  let bestSlug: ModelSlug | null = null;
  let bestCoverage = 0;
  for (const pack of MODEL_PACKS) {
    const coverage = aiTools.filter((t) => {
      if (!t.ai?.capability) return false;
      return pack.capabilities.includes(t.ai.capability);
    }).length;
    if (coverage > bestCoverage) {
      bestCoverage = coverage;
      bestSlug = pack.slug;
    }
  }

  return {
    totalAI: aiTools.length,
    supported,
    unsupported: aiTools.length - supported,
    ollamaOnly,
    specializedOnly,
    bestSlug,
    bestCoverage,
  };
}
