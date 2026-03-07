# PRD: ShipLocal — Local-First Productivity Suite

**Version:** 1.0
**Date:** March 5, 2026
**Table Prefix:** `sl_` (migrated from `st_`)
**Status:** Phase 1 built, ready for rebrand + Phase 2

---

## 1. Problem & Angle

### Problem
Every developer and creator uses free online tools daily — file converters, PDF editors, JSON formatters, image compressors. These tools are free because the user IS the product. iLovePDF sets 637 cookies from 221 domains. SmallPDF loads Hotjar session recording before you upload a file. The conversion is the product you see; the tracking ecosystem is the actual business model.

There's no single place that (a) proves how bad the problem is and (b) gives you a local alternative for every tool you just learned is tracking you.

### Unique Angle
ShipLocal is a **local-first productivity suite**. The privacy auditor shows you WHY you need it — scan any free tool and see exactly how many trackers, cookies, and ad networks it loads. The 30+ built-in tools show you it actually works — file conversion, encryption, PDF signing, developer utilities, all running 100% in your browser.

The audit creates the problem awareness. The local tools are the solution. That's the funnel.

**Why "ShipLocal" instead of "ShipTools":** "ShipTools" sat on no mental shelf. "ShipLocal" bakes the value proposition into the name — everything runs locally, nothing leaves your browser, no cloud, no accounts, no tracking. The hierarchy flips from "toolkit with a privacy auditor" to "local-first suite where the privacy auditor proves why it matters."

### Who Is This For
Developers, indie hackers, and creators who use free online tools daily and don't trust cloud services with their files. They know privacy matters but have no convenient alternative — until now.

---

## 2. Core Features (Phased)

### Phase 1 — Rebrand + Relaunch (BUILT — ready to ship)

Phase 1 is **already built** under the ShipTools name. The work here is renaming, repositioning, and relaunching. 5 feature groups, 38+ individual tools.

**F1: Privacy Auditor (Hero Feature — Top of Funnel)**
Scan any URL → get a privacy grade (A–F) with full tracker breakdown. Generates shareable report card. This is the ONE feature that requires a server (Puppeteer on Vercel). Flagged in UI: "We scan the target website from our server so you don't have to visit it. Your files and data never leave your browser."
- Scans: cookies (first/third-party), third-party domains, session recording (Hotjar/FullStory/LogRocket/Mouseflow/Smartlook), ad networks (Google Ads/Meta Pixel/Amazon), analytics (GA4/Mixpanel/Amplitude/Segment), server-side vs local processing, SSL
- Grading: weighted scoring (cookies 25%, domains 20%, session recording 20%, ads 15%, analytics 10%, server processing 10%). A ≥ 90, B ≥ 75, C ≥ 55, D ≥ 35, F < 35.
- 50+ tracker regex patterns in 4 categories
- SSRF prevention (DNS resolve, private IP rejection), rate limiting (10 scans/IP/hour)
- Cached in Supabase (24h TTL)
- Dynamic OG image per audit (`/api/og/[domain]`)
- **Status:** ✅ Complete
- **Acceptance criteria:** Scan completes in <15s. Report card shareable as screenshot. OG tags populate on social share.

**F2: Local File Converter Suite (6 Categories)**
All processing client-side via WASM and browser APIs. Zero server uploads.
- **Images:** PNG/JPG/WebP/AVIF/GIF/BMP/TIFF/HEIC/HEIF/SVG → WebP/PNG/JPG/AVIF. Quality slider, resize, batch. (wasm-vips via Canvas + libheif-js)
- **Documents:** DOCX→PDF/TXT, PDF→TXT/JSON, CSV↔JSON, TXT→PDF, XLSX→CSV/JSON/TXT. (mammoth + pdf-lib + pdfjs-dist + papaparse + SheetJS)
- **Audio:** MP3/WAV/OGG/AAC/FLAC/M4A/WMA → MP3/WAV/OGG/AAC/FLAC. Bitrate presets, trim. (ffmpeg.wasm ~32MB, lazy singleton)
- **Video:** MP4/WebM/MOV/AVI/MKV/GIF → MP4(H.264)/WebM(VP9)/GIF. Resolution presets, CRF quality, trim. (same ffmpeg.wasm)
- **PDF Tools:** Merge (drag-reorder) + split (page range extraction with thumbnails). (pdf-lib + pdfjs-dist)
- **ZIP:** Create + extract with file tree browser. (jszip)
- Shared `useConverter` hook for unified batch queue, progress, downloads
- **Status:** ✅ Complete (all 6 categories)
- **Acceptance criteria:** Each converter handles batch processing. "All processing happens locally" badge visible on every converter page.

**F3: PDF Signer (Client-Side DocuSign Alternative)**
Upload PDF → draw/type/upload signature → place signatures, text, date stamps on any page → fill form fields (text, checkbox, radio, dropdown) → download signed PDF. Entire workflow in-browser.
- **Status:** ✅ Complete
- **Acceptance criteria:** Produces valid, downloadable PDF with placed signatures. No server roundtrip.

**F4: Developer & Privacy Toolkit (20 Tools)**
All pure JS / native browser APIs. Zero server calls, zero dependencies for most.

*Text & Data:* Base64 encode/decode, JSON formatter (validate/pretty-print/minify/tree/export CSV/YAML), Case converter, Word counter, Regex playground, SVG→React component, Invisible character detector, Epoch converter, JWT decoder

*Cryptography:* Hash calculator (MD5/SHA-1/SHA-256/SHA-512), Password generator (random + EFF passphrase + zxcvbn), File encryption (AES-256-GCM), QR code generator (URL/WiFi/vCard), UUID generator (v4, bulk)

*Privacy & Security:* Browser fingerprint viewer (canvas/WebGL/fonts/hardware), Tracking pixel detector (paste email HTML), EXIF stripper (view + strip GPS/camera/timestamps, batch + ZIP), Clipboard cleaner (strip tracking/styles/Office markup)

*Design:* CSS gradient generator (linear/radial/conic), Contrast checker (WCAG 2.1 AA/AAA)

- **Status:** ✅ Complete (all 20)
- **Acceptance criteria:** Every tool works offline after initial page load. Zero external network calls.

**F5: Transparent Telemetry**
Optional, privacy-respecting analytics. 7 event types. IP hashed (SHA-256 + salt, never stored raw). Country from Vercel header only. Session-based (ephemeral UUID in sessionStorage). Raw events purged after 30 days. Inline consent banner with equal-weight opt-out button. No dark patterns.
- Client tracker via `sendBeacon` (fire-and-forget)
- Daily aggregation cron (03:00 UTC)
- Admin dashboard with custom SVG charts (no chart library)
- **Status:** ✅ Complete
- **Acceptance criteria:** Opt-out immediately stops all events (verifiable in DevTools). Dashboard shows tool popularity, geography, traffic sources.

---

### Phase 2 — Local AI Layer + Platform Expansion (1 sprint)

Phase 2 adds browser-native AI as the headline feature, plus remaining tools from the expansion backlog.

**F6: In-Browser LLM via WebLLM**
Run an LLM entirely in the browser using WebGPU. No server, no API keys, no data ever leaves the device. Uses [WebLLM](https://github.com/mlc-ai/web-llm) (MLC AI, Apache 2.0).
- **Entirely opt-in.** A "✦ Local AI" chip appears on tools that support AI enhancement. First click triggers model download.
- **Tiered model loading** — tries the best model the GPU can handle, auto-falls back:

  | Tier | Model | VRAM (Q4) | Quality |
  |------|-------|-----------|---------|
  | 1 | Qwen2.5-3B-Instruct-q4f16_1-MLC | ~2.5GB | Strong reasoning |
  | 2 | Qwen2.5-1.5B-Instruct-q4f16_1-MLC | ~1.5GB | Good general |
  | 3 | SmolLM2-360M-Instruct-q4f16_1-MLC | ~900MB | Basic fallback |

- First download: ~700MB–1.5GB. Show progress bar: "Downloading AI model — this only happens once." Cached in IndexedDB.
- Subsequent loads: 5–10 seconds from cache.
- Runs in Web Worker (UI never freezes). Streaming token output.
- OpenAI-compatible API for clean integration.
- **UI indicator:** Persistent "AI: Running locally in your browser" badge when model is loaded. Reinforces the local-first promise.
- **WebGPU requirement:** Chrome/Edge 113+, Safari 18+, Firefox 141+ (Windows). ~65% browser coverage. On unsupported browsers, all AI features hidden entirely — no errors, no broken UI.
- "Delete cached model" option in settings.
- **Acceptance criteria:**
  - Model loads in Web Worker without freezing UI
  - Auto-fallback from Tier 1 → 2 → 3 on GPU memory failure
  - Works offline after first model download
  - Streaming responses for all AI features

**F7: Ollama Detection (Hybrid AI for Power Users)**
For users running [Ollama](https://ollama.com) locally, detect it and unlock heavier AI capabilities.
- Health check: `fetch('http://localhost:11434/api/tags')` on app load (silent, non-blocking)
- If Ollama detected: "Local AI: Ollama Connected" badge replaces the WebLLM badge
- AI tools switch from WebLLM (2–3B) to Ollama (whatever model the user has — could be 8B, 70B, etc.)
- Heavier features unlock: long-form summarization, code review, document analysis
- Model picker dropdown shows models available on the user's Ollama instance
- If Ollama goes offline mid-session, gracefully fall back to WebLLM
- **CORS note:** Ollama serves at `localhost:11434` with CORS enabled by default since v0.1.24. If CORS fails, show a one-line fix: `OLLAMA_ORIGINS=* ollama serve`
- **Acceptance criteria:**
  - Detection is silent — no error if Ollama not found
  - Switching between WebLLM and Ollama is seamless (same API interface)
  - Model list populates from Ollama's `/api/tags` endpoint

**F8: AI-Powered Tool Enhancements (Powered by F6/F7)**
Each enhancement activates when a local LLM is loaded. Behind the "✦ Local AI" chip — never active by default.

| Enhancement | Enhances | What It Does |
|------------|----------|-------------|
| **Audit Explainer** | F1: Privacy Auditor | Plain-English explanation of every tracker found ("Hotjar records your mouse movements like a screen recording") |
| **Privacy Policy Summarizer** | New standalone | Paste a privacy policy → 3-section summary: "What they collect / Who they share with / How to delete" |
| **Smart Redactor** | Future: Document Redactor | Context-aware entity detection beyond regex (partial addresses, case numbers, medical terms) |
| **JSON Error Explainer** | F4: JSON Formatter | Plain-English error descriptions + suggested fix with one-click apply |
| **Regex Explainer** | F4: Regex Playground | Paste regex → English explanation. Describe in English → LLM generates regex. |
| **Text Summarizer** | New standalone | Paste long text → local LLM generates concise summary |
| **Text Rewriter** | New standalone | Paste text + tone instruction → rewritten version (more formal, shorter, simpler, etc.) |

- All outputs labeled "Generated by local AI — may contain errors"
- Each dismissable with one click
- Quality degrades gracefully with smaller model tiers
- **Acceptance criteria:** Streaming token output for all. Each works with all three WebLLM tiers.

**F9: AI Background Removal**
Remove background from any image using ONNX model running in-browser via Transformers.js.
- Model: RMBG-1.4 (~40MB, cached after first download)
- "remove.bg but it never sees your photos"
- **Acceptance criteria:** Processes a 2MP image in <5 seconds. Download as PNG with transparent background.

**F10: OCR — Image to Text**
Extract text from images/screenshots using Tesseract.js (WASM).
- 100+ languages supported
- **Acceptance criteria:** Extracts text from a standard screenshot in <10 seconds. Copy to clipboard.

**F11: Speech-to-Text (Whisper)**
Transcribe audio/video files via Transformers.js + Whisper model.
- Model: tiny (~75MB) or base (~150MB), user selects
- Output: plain text, SRT subtitles, VTT format
- **Acceptance criteria:** Transcribes up to 60 minutes. Progress indicator. "Your audio never leaves your browser."

**F12: Remaining Developer Tools**
Fill out the dev utility suite from the Phase 2 backlog:
- Code screenshot generator (Carbon-like, Prism.js + html-to-image)
- Favicon generator (text/emoji/image → all platform sizes, Canvas API + JSZip)
- Diff viewer (side-by-side with highlighted changes, diff2html)
- JSON ↔ YAML ↔ TOML converter (js-yaml + @iarna/toml)
- Color palette generator (extract from uploaded image, Color Thief)
- Markdown editor (live dual-pane, markdown-it)
- SQL formatter (sql-formatter)
- Additional micro-tools: IP/subnet calc, chmod calc, URL parser, HTML entities, number base converter, unit converter, user-agent parser, .env validator, robots.txt generator, CSP header builder
- **Acceptance criteria:** All zero-server, lazy-loaded.

**F13: Privacy Brand Tools**
- Document redactor (PDF/DOCX → auto-detect PII with regex + optional LLM, redact with black boxes)
- Email header analyzer (paste headers → trace server path, detect spoofing)
- File signature checker (upload any file → verify extension matches magic bytes)
- **Acceptance criteria:** Redactor detects 6+ PII patterns. File checker covers 100+ file types.

---

### Phase 3 — Growth & Distribution (1 sprint)

**F14: Browser Extension**
Chrome extension showing ShipLocal grade badge when visiting known free tool sites. Click → full audit + "Use ShipLocal instead" CTA. Cached grade data (no live scan per visit).

**F15: Safe Stack Directory**
Curated database of 30+ popular free tools with ShipLocal privacy grades. SEO pages: `shiplocal.dev/tool/{tool-name}` targeting "is [tool] safe?" queries. Comparison mode: side-by-side 2–3 tools. Scheduled weekly re-scans with grade history.

**F16: Community Leaderboard**
"Safest Free Tools of 2026" and "Most Invasive Free Tools of 2026" — auto-generated from audit data. Monthly refresh. Embeddable "ShipLocal Verified" badge for A-grade tools.

**F17: Public API**
`GET /api/v1/audit/{domain}` → grade + summary. Free tier: 100 lookups/day. API key via Supabase Auth.

**F18: Public Transparency Dashboard**
Live page at `/transparency` showing: exact event schema, live telemetry preview (even when opted out), aggregated public stats (most popular tools, country breakdown), comparison table vs typical free tool tracking.

**F19: Claude Code Skill for Local Offloading**
Package ShipLocal's local processing capabilities as a Claude Code skill. Enable Claude Code agents to offload file conversion, encryption, and other tasks to ShipLocal's browser-native tools.

---

## 3. Design Direction

### Visual Mood
**"Security terminal meets editorial trust."** Dark-mode data dashboard that feels authoritative and trustworthy, not paranoid or alarmist. Makes you feel smart for caring about privacy, not scared. Data-dense where showing audit results, spacious for converter UIs.

### References
- **Observatory by Mozilla** — clinical authority for scanner UI
- **Have I Been Pwned** — simple input, dramatic results, trust-building
- **Linear.app** — dark-mode polish, typography quality, subtle animations

### Theme
Dark mode only. Slate/navy palette. Reinforces "security tool" positioning and differentiates from the bright/cheerful aesthetic of the tools being audited.

### Color Palette (Already Implemented)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0A0E17` | Page background |
| `--bg-surface` | `#111827` | Card surfaces |
| `--bg-elevated` | `#1A2332` | Hover states, active tabs |
| `--text-primary` | `#F1F5F9` | Primary text |
| `--text-secondary` | `#94A3B8` | Muted text |
| `--accent-green` | `#22C55E` | Grade A, safe indicators |
| `--accent-amber` | `#F59E0B` | Grade C, warnings |
| `--accent-red` | `#EF4444` | Grade F, danger |
| `--accent-blue` | `#3B82F6` | Links, CTAs |
| Grade A/B/C/D/F | `#22C55E` / `#84CC16` / `#F59E0B` / `#F97316` / `#EF4444` | Grade-specific |

### Typography (Already Implemented)
- **Display/Headers:** Instrument Sans (variable weight) — geometric, distinctive
- **Body:** IBM Plex Sans — technical, readable in data-dense layouts
- **Monospace:** JetBrains Mono — terminal energy for data values, code

### Key Visual: The Report Card
The privacy audit report card is the most important visual asset — it's the thing people screenshot and share. Dark card, giant letter grade with colored glow, metric tiles (cookies, domains, trackers, recording, ads), "Scanned by ShipLocal" watermark. Must look good at Twitter thumbnail size.

### Key Visual: "AI Running Locally" Indicator
When WebLLM or Ollama is active, a persistent badge shows: "✦ AI: Running locally in your browser" (for WebLLM) or "✦ AI: Ollama Connected" (for local Ollama). This is branding, not just UX — it reinforces the local-first promise every time the user sees it.

---

## 4. Data & API Layer

### Privacy Auditor (Server-Side — The One Exception)

**Puppeteer Scan Flow (already implemented):**
1. Validate URL (Zod) → SSRF check (DNS resolve, private IP rejection)
2. Rate limit (10/IP/hour, in-memory sliding window)
3. Cache lookup in `sl_audits` (24h TTL)
4. Launch Puppeteer (`@sparticuz/chromium` on Vercel, local fallback chain)
5. Block images/fonts/media for speed
6. Navigate with `networkidle2` + 2s extra wait for lazy-loaded trackers
7. Extract cookies, classify domains against 50+ tracker regex patterns
8. Weighted score → grade
9. Cache result in Supabase, return

**Rate Limits:** 10 scans per IP per hour. In-memory sliding window. Auto-cleanup every 5 minutes.

**Cost:** Vercel Pro ($20/month) required for 60s function timeout + 1024MB memory.

### WebLLM (Phase 2)

**Library:** `@mlc-ai/web-llm` — Apache 2.0, WebGPU acceleration, OpenAI-compatible API

**Model Loading:**
```typescript
import { CreateMLCEngine } from "@mlc-ai/web-llm";

const MODEL_TIERS = [
  "Qwen2.5-3B-Instruct-q4f16_1-MLC",    // ~2.5GB VRAM, best quality
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",   // ~1.5GB, good balance
  "SmolLM2-360M-Instruct-q4f16_1-MLC",    // ~900MB, fallback
];

async function loadBestModel() {
  for (const model of MODEL_TIERS) {
    try {
      return await CreateMLCEngine(model, {
        initProgressCallback: (p) => updateLoadingUI(p),
      });
    } catch (e) {
      if (e.message.includes("out of memory")) continue;
      throw e;
    }
  }
  return null; // No GPU support — hide AI features
}
```

**First download:** 700MB–1.5GB depending on tier. Cached in IndexedDB. Subsequent loads 5–10s.

**Web Worker:** All inference runs in a Web Worker. UI never freezes.

### Ollama Detection (Phase 2)

**Health check on app load:**
```typescript
async function detectOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000), // 2s timeout, don't hang
    });
    const data = await res.json();
    return { connected: true, models: data.models };
  } catch {
    return { connected: false, models: [] };
  }
}
```

**What changes when Ollama is detected:**
- Badge switches to "✦ AI: Ollama Connected"
- AI tools use Ollama API (`localhost:11434/api/generate`) instead of WebLLM
- Model picker shows user's installed models
- Heavier features unlock: long-form summarization (>4K tokens), code review, document analysis
- If Ollama disconnects mid-session, fall back to WebLLM silently

### WASM / Client-Side Libraries (Already Implemented)

| Library | Purpose | Size | Load Strategy |
|---------|---------|------|---------------|
| `@ffmpeg/ffmpeg` + `@ffmpeg/util` | Audio + video conversion | ~32MB | Lazy singleton, shared between audio/video |
| `libheif-js` | HEIC/HEIF decoding | ~2MB | Lazy, on HEIC upload only |
| `pdf-lib` | PDF creation, merge, split, signing | ~300KB | Lazy per route |
| `pdfjs-dist` | PDF rendering, text extraction | ~800KB | Lazy per route |
| `mammoth` | DOCX → HTML | ~150KB | Lazy on `/convert/documents` |
| `papaparse` | CSV parsing | ~50KB | Lazy |
| `xlsx` (SheetJS) | Excel parsing | ~300KB | Lazy |
| `jszip` | ZIP create/extract | ~100KB | Lazy |
| `exifr` | EXIF metadata extraction | ~50KB | Lazy on `/tools/exif` |
| `qrcode` | QR code generation | ~50KB | Lazy on `/tools/qr` |
| `zxcvbn` | Password strength | ~400KB | Lazy on `/tools/password` |
| `spark-md5` | MD5 hashing | ~10KB | Lazy on `/tools/hash` |
| `js-yaml` | YAML conversion | ~30KB | Lazy on `/tools/json` |

**Phase 2 additions:**

| Library | Purpose | Size | Load Strategy |
|---------|---------|------|---------------|
| `@mlc-ai/web-llm` | In-browser LLM inference | ~50KB lib + 700MB–1.5GB model | User-initiated download only |
| `Transformers.js` | Background removal, STT, NER | ~40–150MB per model | Lazy per `/ai/*` route |
| `Tesseract.js` | OCR | ~15MB + lang data | Lazy on `/ai/ocr` |

**Native Browser APIs (zero bundle cost):** Web Crypto API (encryption, hashing, UUIDs, passwords), Canvas API (EXIF clean export, image manipulation), DOMParser (clipboard cleaner, tracking pixel detector), WebGPU (WebLLM inference), `navigator.*` (fingerprint viewer).

---

## 5. Tech & Deployment

### Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16+ (App Router, Turbopack) | TypeScript strict mode |
| Styling | Tailwind CSS 4 (`@theme inline`) | Dark mode only |
| Database | Supabase (PostgreSQL) | Audit cache + analytics |
| Auth | Supabase Auth | Phase 1: anonymous. Phase 2: optional accounts for saved audits |
| Analytics | Supabase custom `sl_analytics_*` tables | NOT Umami |
| Deploy | Vercel Pro ($20/month) | 60s function timeout for Puppeteer |
| Scanner | Puppeteer + @sparticuz/chromium | Server-side only |
| Browser AI | @mlc-ai/web-llm (Phase 2) | WebGPU, client-side only |
| Local AI | Ollama detection (Phase 2) | localhost:11434, client-side |
| Domain | shiplocal.dev | Fallbacks: shiplocal.tools, useshiplocal.com |

### Supabase Schema (4 Tables — Rename `st_` → `sl_`)

Migration required: rename all `st_*` tables to `sl_*`. Schema structure stays the same.

```sql
-- sl_audits: Cached scan results (24h TTL)
CREATE TABLE sl_audits (
  id TEXT PRIMARY KEY,                   -- slug e.g. "google-com"
  domain TEXT NOT NULL,
  display_url TEXT NOT NULL,
  grade TEXT NOT NULL,                   -- A/B/C/D/F
  scores JSONB NOT NULL,                 -- weighted score breakdown
  scan JSONB NOT NULL,                   -- full ScanData
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL        -- cached_at + 24h
);

-- sl_audit_requests: Request log
CREATE TABLE sl_audit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  requested_by_ip TEXT NOT NULL,         -- SHA-256 hashed, 16-char truncated
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sl_analytics_events: Raw events (30-day retention)
CREATE TABLE sl_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  session_ip TEXT,                       -- hashed, never raw
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sl_analytics_daily: Pre-aggregated daily rollup
CREATE TABLE sl_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  event TEXT NOT NULL,
  country TEXT DEFAULT 'unknown',
  count INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  UNIQUE(date, event, country)
);
```

**RLS:** `sl_audits` public read, service-role write. `sl_audit_requests` public insert only. `sl_analytics_*` service-role only.

### Environment Variables

| Variable | Required | Status | Purpose |
|----------|----------|--------|---------|
| `SUPABASE_URL` | For DB features | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB features | ✅ | Supabase admin key |
| `IP_HASH_SALT` | No | ✅ | Salt for privacy IP hashing |
| `AUTH_USER` | For admin | ✅ | Dashboard HTTP Basic Auth |
| `AUTH_PASSWORD` | For admin | ✅ | Dashboard HTTP Basic Auth |
| `CRON_SECRET` | For analytics | ✅ | Bearer token for aggregate cron |
| `VERCEL` | Auto-set | ✅ | Environment detection (Chromium strategy) |

**Env file:** `.env.local`, not `.env`

No third-party API keys needed. All conversion is client-side. Puppeteer/Chromium are npm packages. WebLLM models are public on HuggingFace CDN.

### Route Structure (Current → Renamed)

```
src/app/
├── page.tsx                         ← Landing (audit input + tool category grid)
├── audit/[domain]/page.tsx          ← Audit results
├── convert/
│   ├── images/page.tsx
│   ├── documents/page.tsx
│   ├── audio/page.tsx
│   ├── video/page.tsx
│   ├── pdf-tools/page.tsx
│   └── zip/page.tsx
├── sign/page.tsx                    ← PDF signer
├── tools/
│   └── [20 tool routes]/page.tsx
├── ai/                              ← NEW (Phase 2)
│   ├── page.tsx                     ← AI hub + model management
│   ├── background-removal/page.tsx
│   ├── ocr/page.tsx
│   ├── transcribe/page.tsx
│   ├── summarize/page.tsx           ← Text summarizer (WebLLM/Ollama)
│   └── rewrite/page.tsx             ← Text rewriter (WebLLM/Ollama)
├── dashboard/analytics/page.tsx     ← Admin dashboard
├── transparency/page.tsx            ← Public transparency (Phase 3)
└── api/
    ├── audit/scan/route.ts
    ├── analytics/event/route.ts
    ├── analytics/aggregate/route.ts
    ├── dashboard/analytics/route.ts
    └── og/[domain]/route.tsx
```

### Rebrand Migration Checklist

| Task | Scope |
|------|-------|
| Rename Supabase tables `st_*` → `sl_*` | Migration SQL + update all lib references |
| Update all `st_` column prefixes in code | `src/lib/supabase.ts`, API routes, analytics |
| Replace "ShipTools" → "ShipLocal" in all copy | Components, metadata, OG images, footer |
| Update domain references | OG tags, share text, report cards |
| Update `CLAUDE.md` | Project context for AI agents |
| New favicon + logo | Shield + local pin icon |
| Domain setup | `shiplocal.dev` DNS + Vercel custom domain |
| GitHub repo rename or new repo | `jerrysoer/shiplocal` |

---

## 6. Success Criteria

### Phase 1 "Done" (Rebrand + Relaunch)

- [ ] All `st_*` tables renamed to `sl_*`, all code references updated, zero broken queries
- [ ] "ShipLocal" branding across all pages, OG images, report cards, metadata
- [ ] Domain `shiplocal.dev` (or fallback) live and serving
- [ ] All 38+ existing tools functional under new branding
- [ ] Privacy auditor report card says "Scanned by ShipLocal"
- [ ] Launch posts published (LinkedIn + X + Reddit + HN)

### Phase 2 "Done" (AI Layer)

- [ ] WebLLM loads with tiered fallback (3B → 1.5B → 360M), cached in IndexedDB
- [ ] "✦ AI: Running locally" badge visible when model loaded
- [ ] Ollama detection works silently, badge switches to "Ollama Connected" when found
- [ ] AI Audit Explainer generates plain-English tracker descriptions
- [ ] Text summarizer and rewriter work with streaming output
- [ ] Background removal, OCR, and Whisper STT all functional in-browser
- [ ] All AI features hidden on browsers without WebGPU

### Phase 3 "Done" (Growth)

- [ ] Browser extension in Chrome Web Store
- [ ] Safe Stack Directory with 30+ graded tools and SEO pages
- [ ] Public transparency page live

### Hard Constraints

- **Zero file uploads.** No file ever leaves the browser. This is the core promise.
- **Vercel Pro** required for Puppeteer ($20/month).
- **ffmpeg.wasm requires SharedArrayBuffer** — COOP/COEP headers scoped to `/convert/*` only.
- **WebLLM requires WebGPU** — ~65% browser coverage. AI features invisible on unsupported browsers.
- **WebLLM model weights are large** (700MB–1.5GB). Download is user-initiated only, never automatic.
- **No Clerk. No Umami. No Redis.** Auth and analytics both run on Supabase.

---

## 7. Claude Code Skills to Use

### Always Include
- `/frontend-design` — Dark-mode UI, report card design, AI indicator badge
- `/vibesec` — Critical: audit scan endpoint security (SSRF, rate limiting), verify no files touch server, WebLLM sandboxing
- `/code-reviewer` — After each phase

### Include When Relevant
- `/web-dev` — Next.js App Router, TypeScript, Vercel cron
- `/backend-architect` — Supabase schema migration (`st_` → `sl_`), Puppeteer scan, Ollama detection
- `/frontend-developer` — WebLLM integration, WASM lazy loading, streaming token UI

### At Launch
- `/project-shipper` — Launch sequencing per GTM plan
- `/brand-guardian` — Consistent "ShipLocal" branding across all surfaces

---

## 8. GTM Plan

### Positioning Statement

```
FOR developers and creators
WHO don't trust cloud tools with their files and data
ShipLocal IS A local-first productivity suite
THAT runs AI, converters, and dev tools entirely in your browser
UNLIKE random cloud utility sites (SmallPDF, TinyWow, iLovePDF, Genvalo)
OUR PRODUCT sends zero data to any server — ever
```

### One-Liner
"ShipLocal runs 30+ AI and dev tools in your browser. No uploads. No accounts. No tracking."

### Narrative Hook
"Every free tool online tracks you. ShipLocal's privacy auditor proves it — then gives you a local alternative for every tool you just audited."

### Launch Channels (in order)

1. **LinkedIn** (Day 1) — "I audited 20 popular free tools for trackers. Here's what I found." Data-heavy post with the most shocking report cards. Link to ShipLocal.
2. **X/Twitter** (Day 1) — Thread: hook stat + link → individual tool audit screenshots → CTA.
3. **Reddit** (Days 2-5, staggered):
   - **r/webdev** — "I built a local-first dev toolkit with 30+ browser-only tools"
   - **r/privacy** — Lead with audit findings, link to tool
   - **r/SideProject** — Build log: "Built this with Claude Code — here's the stack"
   - **r/InternetIsBeautiful** — Only if design is polished enough
   - **r/selfhosted** — "Not self-hosted, but self-computed — everything runs in your browser"
4. **Hacker News** (Day 3-5) — "Show HN: ShipLocal — 30+ tools that run entirely in your browser, plus a privacy scanner"
5. **Product Hunt** (Week 2-3) — Weekend launch for side project positioning.

### Viral Loop
```
User discovers ShipLocal → audits a tool they use daily
  → shocked by the report card → screenshots it
  → shares on X/LinkedIn → followers audit THEIR tools
  → cycle repeats
```

### Content Drip
| Week | Content | Platform |
|------|---------|----------|
| 1 | Launch: "I audited 20 free tools. Here's what's tracking you." | LinkedIn, X, Reddit |
| 1 | Results: "500 devs scanned their tools in 24 hours" | LinkedIn, X |
| 2 | Spotlight: PDF tool privacy comparison (iLovePDF vs SmallPDF vs ShipLocal) | LinkedIn |
| 2 | Product Hunt launch | LinkedIn, X, PH |
| 3 | "The Safest Free Tools of 2026" — first rankings | LinkedIn, Reddit |
| 3 | Technical: "How I run an LLM in the browser with zero server calls" | LinkedIn, HN, Dev.to |
| 4 | Retro: "I launched ShipLocal. Here's what I learned." | LinkedIn |

### Paid Media
Only after organic gates met (200+ visitors, 3%+ LinkedIn engagement, 30%+ on-site interaction, 60s+ session). Micro-test: $50-100 on LinkedIn targeting "Software Developer" + "Privacy."

---

## Appendix: Known Tech Debt (from ShipTools Build)

Carry these forward — they don't block relaunch but should be addressed:

- **No automated tests.** `useConverter` hook and grading algorithm are prime unit test candidates.
- **DOCX→PDF loses formatting.** mammoth extracts semantic HTML only; tables/images/fonts stripped. No client-side DOCX rendering engine exists in JS.
- **Simplified domain extraction.** Doesn't use Public Suffix List for eTLD+1. Low real-world impact but technically incorrect.
- **Manual tracker database.** 50+ patterns hardcoded in `trackers.ts`. No auto-update mechanism.
- **Rate limiter not persistent.** In-memory, resets on cold start. Acceptable for current scale.
- **No wasm-vips.** Image conversion uses Canvas API + libheif-js. wasm-vips would improve quality (Lanczos resize) but current implementation works.
- **No undo in PDF Signer.** Workaround: re-upload the original.

---

## Appendix: Domain Availability

Check before launch:
```bash
dig shiplocal.dev +short
dig shiplocal.tools +short
dig useshiplocal.com +short
dig goshiplocal.dev +short
```
