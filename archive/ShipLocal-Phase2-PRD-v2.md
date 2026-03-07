# PRD: ShipLocal Phase 2 — Local AI Layer + Platform Expansion

**Version:** 2.0
**Date:** March 6, 2026
**Parent PRD:** ShipLocal v1.0
**Table Prefix:** `sl_`
**Status:** Ready for build (Phase 1 complete)

---

## 1. Problem & Angle

### Problem
ShipLocal Phase 1 proved that 38+ tools can run 100% in the browser. The privacy auditor generates viral report cards, the converters handle real files, and the developer toolkit covers daily needs. But users are now asking: "Can it do AI too?"

Every AI-powered tool today — ChatGPT, Jasper, Copilot, Otter.ai, remove.bg — requires uploading your data to someone else's server. For contracts, financial data, medical notes, proprietary code, and personal documents, that's a non-starter for privacy-conscious users.

### Unique Angle
Phase 2 adds a **Local AI Model Store** — users choose and download purpose-built models that unlock different AI capabilities, all running on their own GPU via WebGPU. Plus Ollama detection for power users who want larger models. No API keys, no server calls, no data leaving the device.

"ShipLocal isn't one-size-fits-all AI. Download the models you need. A Code Assistant for developers. A Reasoning engine for contract analysis. A Tiny model for quick tasks. Mix and match. Switch in seconds. Delete when you're done. Your GPU, your models, your choice."

### Who Benefits
- **Developers:** Code review, commit messages, SQL generation, error decoding — without sending proprietary code to cloud AI
- **Creators:** Summarization, rewriting, social post generation — without feeding content into training data
- **Privacy-conscious professionals:** Contract analysis, receipt parsing, financial categorization — data too sensitive for cloud AI
- **Power users with Ollama:** Unlock 8B+ model quality for heavy tasks, still fully local

---

## 2. Core Features

### F6: Local AI Model Store (WebLLM)

Run LLMs entirely in the browser using WebGPU. No server, no API keys, no data leaves the device. Uses [WebLLM](https://github.com/mlc-ai/web-llm) (MLC AI, Apache 2.0).

Instead of one model, users choose from a **model store** — purpose-built models that unlock different capabilities. Only one model is active in GPU memory at a time, but multiple can be cached in IndexedDB. Switching takes 5–10 seconds from cache.

#### Model Lineup

| Model Pack | Actual Model | Download | VRAM | Best At | Key Unlocks |
|-----------|-------------|----------|------|---------|-------------|
| ⚡ **Tiny (Fast)** | SmolLM2-360M-Instruct-q4f16_1-MLC | ~400MB | ~900MB | Quick tasks, classification, short rewrites | Sentiment analysis, keyword extraction, text classification, language detection |
| 🪶 **Balanced** | Qwen2.5-1.5B-Instruct-q4f16_1-MLC | ~800MB | ~1.5GB | Good quality, moderate hardware | Above + summarization, rewriting, audit explainer, JSON error explainer |
| 🧠 **General Assistant** ⭐ | Qwen2.5-3B-Instruct-q4f16_1-MLC | ~1.5GB | ~2.5GB | All-around best for size | Above + structured JSON extraction, contract analysis, email composition, receipt parsing, privacy policy summarizer, social posts, meeting minutes, translation. **Recommended default.** |
| 💻 **Code Assistant** | Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC | ~1.8GB | ~2.5GB | Code understanding & generation | Code review, code explanation, commit messages, PR descriptions, SQL generation, test generation, error decoding, Dockerfile/README generation. Significantly better than General at code tasks. |
| 🧮 **Math & Reasoning** | Phi-3.5-mini-instruct-q4f16_1-MLC | ~2.8GB | ~3GB | Logic, math, structured analysis | SWOT analysis, financial categorization, complex contract analysis, threat modeling, architecture decisions. Stronger reasoning than General but heavier. |

#### Feature-to-Model Capability Matrix

| Feature | ⚡ Tiny | 🪶 Balanced | 🧠 General | 💻 Code | 🧮 Reasoning | 🔌 Ollama 8B+ |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| Sentiment / classification | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Keyword extraction | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Short summarization (<2K words) | ⚠️ | ✅ | ✅ | — | ✅ | ✅ |
| Text rewriting / tone change | ⚠️ | ✅ | ✅ | — | ✅ | ✅ |
| Audit tracker explainer | ❌ | ✅ | ✅ | — | ✅ | ✅ |
| JSON / regex explainer | ❌ | ✅ | ✅ | ✅✅ | ✅ | ✅ |
| Structured JSON extraction | ❌ | ⚠️ | ✅ | — | ✅ | ✅ |
| Email / social post composer | ❌ | ⚠️ | ✅ | — | ✅ | ✅ |
| Contract clause analyzer | ❌ | ❌ | ✅ | — | ✅✅ | ✅✅✅ |
| Receipt / invoice parser | ❌ | ⚠️ | ✅ | — | ✅ | ✅ |
| Privacy policy summarizer | ❌ | ⚠️ | ✅ | — | ✅ | ✅ |
| Meeting minutes generator | ❌ | ❌ | ✅ | — | ✅ | ✅✅ |
| Code review / explanation | ❌ | ❌ | ⚠️ | ✅ | ⚠️ | ✅✅ |
| Commit message / PR description | ❌ | ⚠️ | ✅ | ✅✅ | ✅ | ✅ |
| SQL / test generation | ❌ | ❌ | ⚠️ | ✅ | ⚠️ | ✅ |
| SWOT / competitive analysis | ❌ | ❌ | ⚠️ | ❌ | ✅ | ✅✅ |
| Translation (non-English) | ❌ | ⚠️ | ✅ | — | ⚠️ | ✅ |
| Long document summary (>5K) | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Full file code review | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Legend: ✅ reliable, ⚠️ works but quality varies, ❌ don't surface this feature, ✅✅ this model is best for this task, — not applicable for this model type*

#### UX: First AI Interaction

When user clicks any "✦ AI" chip for the first time, show the model picker:

```
┌──────────────────────────────────────────────────┐
│  Choose your Local AI model                      │
│                                                  │
│  Your data never leaves your browser.            │
│  Models download once and run on your GPU.       │
│                                                  │
│  ⭐ RECOMMENDED                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 🧠 General Assistant — Qwen2.5 3B       │    │
│  │ 1.5GB download · Best all-around         │    │
│  │ Unlocks: 20+ AI features                 │    │
│  │                         [Download]       │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  MORE OPTIONS                                    │
│  ⚡ Tiny (400MB) — Fast, basic features          │
│  🪶 Balanced (800MB) — Good quality, less VRAM   │
│  💻 Code (1.8GB) — Optimized for developers      │
│  🧮 Reasoning (2.8GB) — Complex analysis         │
│                                                  │
│  [Browse all models →]                           │
│                                                  │
│  💡 Have Ollama? ShipLocal detects it             │
│     automatically for the best quality.          │
└──────────────────────────────────────────────────┘
```

#### UX: Model Management Page (`/ai/models`)

- Shows all downloaded models with storage used per model
- Switch active model with one click (5–10s reload from cache)
- Delete individual models to free storage
- Download additional models
- Storage meter: "3.3GB used of ~5GB available"
- Ollama connection status + model list
- Auto-switch toggle (see below)

#### UX: Context-Aware Model Suggestions

When a user opens a tool and their current model isn't the best fit:
- Code tool with General loaded: "💡 The Code Assistant gives better results for this. [Download (1.8GB)]"
- Contract analyzer with Tiny loaded: "⚠️ This feature needs General or Reasoning for reliable results. [Switch]"
- Features gated by model capability show a lock icon: "🔒 Requires General or higher — [Download]"

#### UX: Auto-Switch (Optional Setting)

Power user setting in `/ai/models`: "Auto-switch models based on task." When enabled, ShipLocal loads the best *downloaded* model for the current tool. Takes 5–10s to switch. Default: off.

If enabled:
- Opening a code tool → switches to 💻 Code model (if downloaded)
- Opening contract analyzer → switches to 🧮 Reasoning (if downloaded)
- Opening text rewriter → switches to 🧠 General
- Opening a quick classification → switches to ⚡ Tiny for speed

#### UX: "✦ AI" Chip States

| State | Chip Appearance | Meaning |
|-------|----------------|---------|
| No model | `[✦ AI]` gray | Click to open model picker |
| Downloading | `[✦ AI Loading... 64%]` blue, animated | Model downloading |
| WebLLM active | `[✦ AI Ready]` green | Model loaded, feature available |
| Ollama active | `[✦ AI: Ollama]` purple | Using local Ollama server |
| Feature locked | `[🔒 Needs 🧠 General]` gray + lock | Active model lacks capability |

#### Technical Implementation

```typescript
// src/lib/ai/models.ts

import { CreateMLCEngine, type MLCEngineInterface } from "@mlc-ai/web-llm";

export const MODEL_REGISTRY = {
  tiny: {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    name: "Tiny (Fast)", icon: "⚡", size: "400MB", vram: "900MB",
    capabilities: ["classification", "sentiment", "keywords", "language_detect"],
  },
  balanced: {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Balanced", icon: "🪶", size: "800MB", vram: "1.5GB",
    capabilities: ["classification", "sentiment", "keywords", "rewrite",
                    "summarize_short", "audit_explain", "json_explain"],
  },
  general: {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    name: "General Assistant", icon: "🧠", size: "1.5GB", vram: "2.5GB",
    recommended: true,
    capabilities: ["classification", "sentiment", "keywords", "rewrite",
                    "summarize_short", "summarize_medium", "extract_json",
                    "audit_explain", "json_explain", "regex_explain",
                    "email_compose", "contract_analyze", "receipt_parse",
                    "privacy_policy", "social_post", "meeting_minutes",
                    "commit_message", "translate"],
  },
  code: {
    id: "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
    name: "Code Assistant", icon: "💻", size: "1.8GB", vram: "2.5GB",
    capabilities: ["code_review", "code_explain", "code_translate",
                    "commit_message", "pr_description", "sql_generate",
                    "test_generate", "error_decode", "json_explain",
                    "regex_explain", "dockerfile", "readme"],
  },
  reasoning: {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Math & Reasoning", icon: "🧮", size: "2.8GB", vram: "3GB",
    capabilities: ["classification", "sentiment", "rewrite",
                    "summarize_short", "summarize_medium", "extract_json",
                    "contract_analyze", "swot", "threat_model",
                    "financial_categorize", "receipt_parse", "meeting_minutes"],
  },
} as const;

export type ModelKey = keyof typeof MODEL_REGISTRY;

// Feature gating — called by every "✦ AI" chip to determine state
export function canUseFeature(
  feature: string,
  activeModelKey: ModelKey | null
): {
  available: boolean;
  quality: "excellent" | "good" | "basic" | "unavailable";
  betterModel?: ModelKey;
} {
  if (!activeModelKey) return { available: false, quality: "unavailable" };
  const model = MODEL_REGISTRY[activeModelKey];
  if (!model) return { available: false, quality: "unavailable" };
  const has = model.capabilities.includes(feature);
  
  // Check if a different model would be better
  let betterModel: ModelKey | undefined;
  if (has) {
    // Find the "best" model for this feature (✅✅ in the matrix)
    for (const [key, m] of Object.entries(MODEL_REGISTRY)) {
      if (m.capabilities.includes(feature) && key !== activeModelKey) {
        // Heuristic: code features → code model, reasoning features → reasoning model
        if (feature.startsWith("code_") && key === "code") betterModel = key as ModelKey;
        if (["swot", "threat_model", "contract_analyze"].includes(feature) && key === "reasoning") 
          betterModel = key as ModelKey;
      }
    }
  }
  
  return { available: has, quality: has ? "good" : "unavailable", betterModel };
}

// Model lifecycle
let engine: MLCEngineInterface | null = null;
let activeModelKey: ModelKey | null = null;

export async function loadModel(
  modelKey: ModelKey,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<MLCEngineInterface> {
  const model = MODEL_REGISTRY[modelKey];
  engine = await CreateMLCEngine(model.id, {
    initProgressCallback: onProgress,
  });
  activeModelKey = modelKey;
  return engine;
}

export async function switchModel(modelKey: ModelKey): Promise<void> {
  if (!engine) throw new Error("No engine loaded");
  const model = MODEL_REGISTRY[modelKey];
  await engine.reload(model.id); // ~5-10s from IndexedDB cache
  activeModelKey = modelKey;
}

export function getActiveModel(): ModelKey | null {
  return activeModelKey;
}

export function getEngine(): MLCEngineInterface | null {
  return engine;
}
```

**JSON Schema Mode (for structured extraction):**

```typescript
// Used by receipt parser, contract analyzer, structured data extractor, etc.
const response = await engine.chat.completions.create({
  messages: [
    { role: "system", content: "Extract receipt data from the following text." },
    { role: "user", content: ocrText }
  ],
  response_format: {
    type: "json_object",
    schema: {
      type: "object",
      properties: {
        vendor: { type: "string" },
        date: { type: "string" },
        total: { type: "number" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price: { type: "number" }
            }
          }
        }
      },
      required: ["vendor", "date", "total"]
    }
  }
});

const receiptData = JSON.parse(response.choices[0].message.content);
// Guaranteed valid JSON matching the schema
```

**WebGPU Requirement:** Chrome/Edge 113+, Safari 18+, Firefox 141+ (Windows). ~65% browser coverage. On unsupported browsers, entire AI section hidden — no errors, no broken UI.

**Acceptance criteria:**
- First-time model picker shows when any "✦ AI" chip is clicked
- Download progress bar with percentage and estimated time remaining
- Model switching from IndexedDB cache completes in <10 seconds
- Features correctly gate based on active model's capability matrix
- Lock icon + download CTA shown for features requiring a different model
- `/ai/models` page shows all downloaded models, storage used, active indicator
- "Delete model" removes from IndexedDB and frees storage
- Auto-switch setting works when enabled (loads best downloaded model per tool)
- Works offline after initial model download(s)
- Graceful GPU memory fallback: if selected model won't fit, suggest next smaller model

---

### F7: Ollama Detection (Hybrid AI for Power Users)

For users running [Ollama](https://ollama.com) locally, detect it and unlock heavier AI capabilities beyond what browser models can handle.

**Detection:**
```typescript
// src/lib/ai/ollama.ts

export interface OllamaStatus {
  connected: boolean;
  models: { name: string; size: number; modified_at: string }[];
}

export async function detectOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000), // 2s timeout, don't hang
    });
    const data = await res.json();
    return { connected: true, models: data.models || [] };
  } catch {
    return { connected: false, models: [] };
  }
}

// Generate with Ollama (same interface pattern as WebLLM)
export async function ollamaGenerate(
  model: string,
  prompt: string,
  options?: { stream?: boolean; format?: "json" }
): Promise<string> {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({ model, prompt, stream: false, ...options }),
  });
  const data = await res.json();
  return data.response;
}
```

**Behavior:**
- Health check on app load — silent, non-blocking, 2s timeout
- If Ollama detected: "✦ AI: Ollama Connected" badge (purple) replaces WebLLM badge
- AI tools route to Ollama API (`localhost:11434/api/generate`) instead of WebLLM
- Model picker on `/ai/models` shows **both** WebLLM models AND Ollama models in one unified list
  - WebLLM models tagged "🌐 In-Browser"
  - Ollama models tagged "🔌 Local Server"
- Heavier Ollama-only features unlock (marked in capability matrix): long-form summarization, full file code review, architecture decisions
- If Ollama goes offline mid-session, gracefully fall back to active WebLLM model
- **CORS:** Ollama serves at `localhost:11434` with CORS enabled by default since v0.1.24. If CORS fails, show one-line fix: `OLLAMA_ORIGINS=* ollama serve`

**Acceptance criteria:**
- Detection is silent — no error if Ollama not found
- Switching between WebLLM and Ollama is seamless (same API interface internally)
- Model list unifies WebLLM + Ollama models in one picker
- Ollama-only features show "🔌 Requires Ollama" instead of a download button
- Ollama disconnect → WebLLM fallback happens without user intervention

---

### F8: AI-Powered Tool Enhancements (Powered by F6/F7)

Each enhancement activates when a local LLM is loaded AND the active model has the required capability. Behind the "✦ AI" chip — never active by default. Features gated by model: if the active model can't handle it, show a lock icon with upgrade path.

#### Tier 1 — Core Enhancements (🪶 Balanced and above)

| Enhancement | Enhances | What It Does | Requires |
|------------|----------|-------------|----------|
| **Audit Explainer** | F1: Privacy Auditor | Plain-English explanation of every tracker found ("Hotjar records your mouse movements like a screen recording") | 🪶 Balanced+ |
| **Privacy Policy Summarizer** | New standalone (`/ai/privacy-policy`) | Paste policy → "What they collect / Who they share with / How to delete" | 🧠 General+ |
| **Smart Redactor** | F13: Document Redactor | Context-aware entity detection beyond regex (addresses, case numbers, medical terms) | 🧠 General+ |
| **JSON Error Explainer** | F4: JSON Formatter | Plain-English error description + suggested fix + one-click apply | 🪶 Balanced+ (💻 Code best) |
| **Regex Explainer** | F4: Regex Playground | Paste regex → English explanation. Describe in English → LLM generates regex. | 🪶 Balanced+ (💻 Code best) |
| **Text Summarizer** | New standalone (`/ai/summarize`) | Paste long text → concise summary | 🪶 Balanced+ |
| **Text Rewriter** | New standalone (`/ai/rewrite`) | Paste text + tone → rewritten version (formal, shorter, simpler, etc.) | 🪶 Balanced+ |
| **Email Composer** | New standalone (`/ai/email`) | Describe what to say + tone → draft email with multiple variants | 🧠 General+ |
| **Social Media Post Generator** | New standalone (`/ai/social`) | Describe what to promote → variants for LinkedIn, X, Reddit | 🧠 General+ |

#### Tier 2 — Structured Extraction (🧠 General and above, JSON Schema mode)

| Enhancement | What It Does | Requires |
|------------|-------------|----------|
| **Structured Data Extractor** | Define any JSON schema + paste text → LLM extracts structured data. The universal extraction tool. | 🧠 General+ |
| **Receipt / Invoice Parser** | OCR (Tesseract) → LLM extracts vendor, date, total, line items, tax → JSON + CSV export | 🧠 General+ |
| **Business Card Scanner** | OCR → LLM extracts name, title, company, email, phone → vCard export | 🧠 General+ |
| **Email Data Extractor** | Paste email → extract intent, action items, dates, key decisions, people referenced | 🧠 General+ |
| **Contract Clause Analyzer** | Paste contract/ToS → flag concerning clauses (auto-renewal, liability, data sharing, non-compete), rate each red/yellow/green | 🧠 General+ (🧮 Reasoning best, 🔌 Ollama excellent) |
| **Meeting Minutes Generator** | From Whisper transcript → decisions, action items, owners, deadlines → formatted minutes | 🧠 General+ |
| **Job Description Analyzer** | Paste JD → must-haves vs nice-to-haves, salary signals, red flags, culture indicators | 🧠 General+ |

#### Tier 3 — Code Features (💻 Code model, basic quality with 🧠 General)

| Enhancement | What It Does | Requires |
|------------|-------------|----------|
| **Commit Message Generator** | Paste diff → conventional commit message (JSON Schema: `{ type, scope, message }`) | 🪶 Balanced+ (💻 Code best) |
| **Code Explainer** | Paste code → line-by-line or block-by-block explanation | 💻 Code (🧠 General basic) |
| **Code Reviewer** | Paste code → bugs, security, performance, style issues as structured JSON | 💻 Code (🔌 Ollama best) |
| **Error Message Decoder** | Paste error/stack trace → plain-English cause + likely fix | 💻 Code (🧠 General basic) |
| **SQL Generator** | English description + table schema → SQL query | 💻 Code |
| **Test Case Generator** | Paste function → unit test cases with edge cases | 💻 Code (🔌 Ollama best) |
| **PR Description Writer** | Paste diff or change list → PR description with summary, changes, testing notes | 💻 Code |
| **README Generator** | Paste package.json + brief description → structured README | 💻 Code |

#### Tier 4 — Analysis (🧮 Reasoning or 🔌 Ollama)

| Enhancement | What It Does | Requires |
|------------|-------------|----------|
| **SWOT Analyzer** | Describe business/product → structured SWOT analysis as JSON | 🧮 Reasoning+ |
| **Competitor Quick-Audit** | Paste landing page text → extract value prop, audience, pricing model, differentiators | 🧠 General+ (🧮 Reasoning best) |
| **Sentiment Analyzer** | Paste reviews/comments → classify sentiment + extract themes (structured JSON) | ⚡ Tiny+ |
| **Tone Analyzer** | Paste text → formal/casual, confident/tentative, passive-aggressive detection | 🪶 Balanced+ |
| **Keyword Extractor** | Paste text → keywords/keyphrases ranked by importance | ⚡ Tiny+ |

#### Tier 5 — Ollama-Only Power Features

| Enhancement | What It Does | Why 8B+ Required |
|------------|-------------|-------------------|
| **Long Document Summarizer** | Summarize >10K words with section-by-section analysis | Small models lose coherence on long contexts |
| **Full File Code Review** | Review 500+ line files for bugs, security, performance | Needs strong code understanding |
| **Technical Writing Assistant** | Full blog posts, documentation, guides with iterative editing | Quality matters for long-form |
| **Database Schema Designer** | Describe app → SQL schema with indexes, constraints, RLS | Complex reasoning required |
| **Architecture Decision Helper** | Describe decision → ADR with pros/cons/alternatives | Nuanced tradeoff analysis |

#### Cross-Cutting Rules (All Tiers)

- All outputs labeled "Generated by local AI — may contain errors"
- Each output dismissable with one click
- Lock icon + model upgrade path for gated features: "Needs 🧠 General — [Download 1.5GB]" or "Needs 🔌 Ollama — [Setup guide →]"
- Each tier works independently — user doesn't need every model
- **Acceptance criteria:**
  - Features correctly gate per active model capabilities
  - Structured JSON extraction outputs valid, parseable JSON matching user-defined schemas
  - Streaming token output for all freeform text features
  - Lock icon shows clear upgrade path with download size
  - Quality labels shown where relevant ("⚠️ Basic quality with current model. Switch to 💻 Code for better results.")

---

### F9: AI Background Removal

Remove background from any image using ONNX model running in-browser via Transformers.js.
- Model: RMBG-1.4 (~40MB, cached after first download)
- Separate from the WebLLM model store — this is a vision model, not an LLM
- "remove.bg but it never sees your photos"
- **Acceptance criteria:** Processes a 2MP image in <5 seconds. Download as PNG with transparent background.

---

### F10: OCR — Image to Text

Extract text from images/screenshots using Tesseract.js (WASM).
- 100+ languages supported
- Separate from WebLLM — runs via Tesseract WASM, not an LLM
- Pairs with F8 Tier 2 features: OCR output → LLM structured extraction (receipt parser, business card scanner)
- **Acceptance criteria:** Extracts text from a standard screenshot in <10 seconds. Copy to clipboard.

---

### F11: Speech-to-Text (Whisper)

Transcribe audio/video files via Transformers.js + Whisper model.
- Model: tiny (~75MB) or base (~150MB), user selects
- Separate from WebLLM — runs via Transformers.js WASM
- Output: plain text, SRT subtitles, VTT format
- Pairs with F8: transcript → meeting minutes generator, → summarizer
- **Acceptance criteria:** Transcribes up to 60 minutes. Progress indicator. "Your audio never leaves your browser."

---

### F12: Remaining Developer Tools

Fill out the dev utility suite from the Phase 2 backlog:
- Code screenshot generator (Carbon-like, Prism.js + html-to-image)
- Favicon generator (text/emoji/image → all platform sizes, Canvas API + JSZip)
- Diff viewer (side-by-side with highlighted changes, diff2html)
- JSON ↔ YAML ↔ TOML converter (js-yaml + @iarna/toml)
- Color palette generator (extract from uploaded image, Color Thief)
- Markdown editor (live dual-pane, markdown-it)
- SQL formatter (sql-formatter)
- Additional micro-tools: IP/subnet calc, chmod calc, URL parser, HTML entities, number base converter, unit converter, user-agent parser, .env validator, robots.txt generator, CSP header builder
- **Acceptance criteria:** All zero-server, lazy-loaded per route.

---

### F13: Privacy Brand Tools

- Document redactor (PDF/DOCX → auto-detect PII with regex + optional LLM via F8 Smart Redactor, redact with black boxes)
- Email header analyzer (paste headers → trace server path, detect spoofing)
- File signature checker (upload any file → verify extension matches magic bytes)
- **Acceptance criteria:** Redactor detects 6+ PII patterns. File checker covers 100+ file types.

---

## 3. Data & API Layer

### New Dependencies (Phase 2 Only)

| Library | Purpose | Size | Load Strategy |
|---------|---------|------|---------------|
| `@mlc-ai/web-llm` | Local AI Model Store (5 model packs) | ~50KB lib + 400MB–2.8GB per model | User selects via model store, multiple cached in IndexedDB, one active in GPU |
| `Transformers.js` | Background removal (F9), Whisper STT (F11), NER for redactor (F13) | ~40–150MB per model | Lazy per `/ai/*` route |
| `Tesseract.js` | OCR (F10) | ~15MB + language data | Lazy on `/ai/ocr` |
| `diff2html` | Diff viewer (F12) | ~100KB | Lazy on diff tool route |
| `Color Thief` | Color palette extraction (F12) | ~10KB | Lazy |
| `markdown-it` | Markdown editor (F12) | ~100KB | Lazy |
| `sql-formatter` | SQL formatter (F12) | ~50KB | Lazy |
| `Prism.js` | Code screenshot syntax highlighting (F12) | ~50KB | Lazy |
| `html-to-image` | Code screenshot export (F12) | ~30KB | Lazy |

**Native Browser APIs (zero cost):** WebGPU (WebLLM inference), Canvas API (background removal output, favicon generation), Web Workers (LLM inference thread).

### New Routes

```
src/app/ai/
├── page.tsx                         ← AI hub: feature showcase, model status
├── models/page.tsx                  ← Model store: download, switch, delete, storage
├── background-removal/page.tsx      ← F9
├── ocr/page.tsx                     ← F10
├── transcribe/page.tsx              ← F11
├── summarize/page.tsx               ← Text summarizer
├── rewrite/page.tsx                 ← Text rewriter
├── email/page.tsx                   ← Email composer
├── social/page.tsx                  ← Social media post generator
├── extract/page.tsx                 ← Structured data extractor (JSON Schema)
├── contracts/page.tsx               ← Contract clause analyzer
├── receipts/page.tsx                ← Receipt/invoice parser (OCR + LLM)
└── privacy-policy/page.tsx          ← Privacy policy summarizer
```

### New Components

```
src/lib/ai/
├── models.ts                        ← MODEL_REGISTRY, canUseFeature(), loadModel(), switchModel()
├── ollama.ts                        ← detectOllama(), ollamaGenerate(), health check
├── provider.ts                      ← Unified AI provider (routes to WebLLM or Ollama based on active source)
├── prompts/                         ← Prompt templates per feature
│   ├── audit-explain.ts
│   ├── contract-analyze.ts
│   ├── receipt-parse.ts
│   ├── code-review.ts
│   ├── summarize.ts
│   └── ...
└── schemas/                         ← JSON Schemas for structured extraction
    ├── receipt.ts
    ├── business-card.ts
    ├── contract-clause.ts
    ├── meeting-minutes.ts
    └── ...

src/components/ai/
├── ModelPicker.tsx                   ← First-time model selection modal
├── ModelManager.tsx                  ← /ai/models page UI (download, switch, delete, storage)
├── AIChip.tsx                        ← Universal "✦ AI" chip component (handles all states)
├── AIBadge.tsx                       ← Persistent "AI: Running locally" badge
├── ModelSuggestion.tsx               ← Context-aware "💡 Better model available" banner
├── StreamingOutput.tsx               ← Streaming token display component
├── StructuredOutput.tsx              ← Renders structured JSON extraction results as formatted UI
└── FeatureLock.tsx                   ← "🔒 Requires X model" component with download CTA
```

### Unified AI Provider Pattern

```typescript
// src/lib/ai/provider.ts
// Single interface for all AI calls — routes to WebLLM or Ollama transparently

export async function aiGenerate(options: {
  messages: { role: string; content: string }[];
  responseFormat?: { type: "json_object"; schema: object };
  stream?: boolean;
}): Promise<string | AsyncIterable<string>> {
  const source = getActiveAISource(); // 'webllm' | 'ollama'
  
  if (source === 'ollama') {
    return ollamaGenerate(getActiveOllamaModel(), options);
  } else {
    return webllmGenerate(getEngine(), options);
  }
}
```

This means every AI feature calls `aiGenerate()` and doesn't care whether it's running WebLLM or Ollama. One integration point, two backends.

---

## 4. Success Criteria

### Phase 2 "Done" Definition

**Model Store (F6):**
- [ ] `/ai/models` page shows 5 model packs with download/switch/delete
- [ ] First "✦ AI" click anywhere surfaces model picker with recommended default (🧠 General)
- [ ] Download progress bar with percentage and estimated time
- [ ] Model switching from IndexedDB cache completes in <10 seconds
- [ ] Storage meter shows total cached model size with per-model delete
- [ ] Works offline after initial model download(s)
- [ ] Graceful GPU memory fallback: if model won't fit, suggest smaller

**Feature Gating:**
- [ ] Features correctly gate based on active model's capability matrix
- [ ] Lock icon + upgrade path shown for features requiring a different model
- [ ] Context-aware suggestions: "💡 Code Assistant gives better results for this tool"
- [ ] Auto-switch setting works when enabled

**Ollama (F7):**
- [ ] Detection is silent — no error if Ollama not found
- [ ] Unified model picker shows both WebLLM + Ollama models
- [ ] Ollama-only features show "🔌 Requires Ollama" with setup guide
- [ ] Ollama disconnect → WebLLM fallback without user intervention

**AI Enhancements (F8):**
- [ ] Structured JSON extraction produces valid JSON matching user-defined schemas
- [ ] All freeform AI features stream tokens in real-time
- [ ] Contract clause analyzer flags concerning clauses with red/yellow/green ratings
- [ ] Receipt parser extracts vendor, date, total, line items from OCR text
- [ ] All outputs labeled "Generated by local AI — may contain errors"

**Vision/Audio AI (F9-F11):**
- [ ] Background removal processes 2MP image in <5 seconds
- [ ] OCR extracts text from screenshots in <10 seconds across 100+ languages
- [ ] Whisper transcribes up to 60 minutes with progress indicator

**All AI features:**
- [ ] Hidden entirely on browsers without WebGPU (no errors, no broken UI)
- [ ] Every tool works perfectly WITHOUT any AI model loaded (AI is enhancement, never dependency)
- [ ] "Your data never leaves your browser" messaging on every AI page

---

## 5. Claude Code Skills to Use

- `/frontend-design` — Model store UI, model picker modal, AI chip states, streaming output component, lock/upgrade UX
- `/web-dev` — WebLLM integration, Web Worker setup, IndexedDB caching, Ollama API calls
- `/backend-architect` — Unified AI provider pattern, prompt template architecture, JSON Schema definitions
- `/frontend-developer` — Streaming token rendering, progress bars, model switching animations, capability gating logic
- `/vibesec` — Verify: no model data or prompts sent to any server, WebLLM sandboxed in Web Worker, Ollama calls only to localhost, no user content logged
- `/code-reviewer` — Review entire `src/lib/ai/` module before shipping

---

## 6. GTM for Phase 2 Launch

### Headline
"ShipLocal now has AI that never leaves your device. Choose your model. Run it on your GPU."

### Launch Posts

1. **LinkedIn (Day 1):** "I added AI to ShipLocal — but instead of an API key, users download a model that runs on their own GPU. Contract analysis, code review, receipt parsing — all in the browser. Here's why local AI changes everything."

2. **HN (Day 3):** "Show HN: ShipLocal — local-first browser toolkit now with WebLLM model store (choose from 5 models, run on your GPU, no API calls)"

3. **Reddit r/selfhosted (Day 4):** "Not self-hosted — self-computed. ShipLocal's AI runs entirely in your browser GPU. Even detects Ollama for heavier models."

4. **Technical blog (Week 2):** "How we built a model store in the browser with WebLLM: JSON Schema extraction, multi-model management, and Ollama fallback"

### The Demo Moment
The hero demo for Phase 2 launch: "I pasted my NDA into ShipLocal. It analyzed every clause, flagged 3 concerning sections, and explained why — all in my browser. The text never touched a server."

That's the screenshot that goes viral.
