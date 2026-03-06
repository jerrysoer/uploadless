# ShipLocal — Comprehensive Project Status

> **Purpose:** Self-contained technical snapshot of the ShipLocal project — what's built, how it works, what broke along the way, and where it's going. Written for upload to Claude for further thinking.

---

## 1. Project Overview

**ShipLocal** is a privacy-first developer tool platform that runs entirely in the browser. The core thesis: every free online tool (converters, formatters, generators) uploads your files to a server you don't control. ShipLocal does everything client-side with WASM, Web Crypto, and Canvas APIs — zero server uploads.

The one exception is the **Privacy Auditor**, which necessarily runs server-side (Puppeteer) to scan websites for trackers, cookies, and ad networks, grading them A–F.

### Core Philosophy

- **Privacy-first:** All file processing happens in the browser. No uploads, no telemetry by default.
- **Browser-native:** Leverage modern Web APIs (SharedArrayBuffer, Web Crypto, Canvas, WASM) instead of server roundtrips.
- **Transparent telemetry:** Optional analytics with visible opt-out, no dark patterns, IP never stored raw.
- **Graceful degradation:** Everything works without Supabase configured (API routes return 503 gracefully).

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript (strict mode) | ^5.8.0 |
| Styling | Tailwind CSS 4 (`@theme inline`) | ^4.1.0 |
| Backend | Supabase (PostgreSQL) | ^2.98.0 |
| Scanner | Puppeteer + @sparticuz/chromium | ^24.0.0 / ^133.0.0 |
| Image WASM | wasm-vips (CDN), libheif-js | ^1.19.8 |
| Audio/Video WASM | @ffmpeg/ffmpeg + @ffmpeg/util | ^0.12.10 / ^0.12.2 |
| PDF | pdf-lib + pdfjs-dist | ^1.17.1 / ^4.10.38 |
| Documents | mammoth (DOCX), papaparse (CSV), xlsx (Excel) | ^1.8.0 / ^5.5.0 / ^0.18.5 |
| Archives | jszip | ^3.10.1 |
| Validation | Zod | ^3.24.0 |
| Icons | Lucide React | ^0.575.0 |
| OG Images | @vercel/og (Edge) | ^0.6.0 |
| Hashing | spark-md5, Web Crypto API | ^3.0.2 |
| QR Codes | qrcode | ^1.5.4 |
| Password Strength | zxcvbn | ^4.4.2 |
| YAML | js-yaml | ^4.1.1 |
| EXIF | exifr | ^7.1.3 |
| IDs | nanoid | ^5.1.6 |
| Deployment | Vercel (Pro plan for 60s functions) | — |

### Design System

- **Theme:** Dark (slate/navy) — `#0A0E17` primary, `#111827` surface, `#1A2332` elevated
- **Grade palette:** A=`#22C55E`, B=`#84CC16`, C=`#F59E0B`, D=`#F97316`, F=`#EF4444`
- **Fonts:** IBM Plex Sans (body), Instrument Sans (headings), JetBrains Mono (code)
- **Animations:** Grade reveal (pop), scan-line (terminal sweep), done-check (scale pop-in), fade-in (slide-up)

---

## 2. Feature Inventory

### 2.1 Privacy Auditor

**Status: ✅ Complete**

Server-side Puppeteer scanner that audits any website for privacy risks.

| Component | File | Purpose |
|-----------|------|---------|
| Scanner orchestrator | `src/lib/scanner/index.ts` | Launch browser, intercept requests, extract cookies, classify |
| Tracker database | `src/lib/scanner/trackers.ts` | 50+ regex patterns across 4 categories |
| Cookie classifier | `src/lib/scanner/classify.ts` | First-party vs third-party, server-side detection |
| Grading algorithm | `src/lib/grading.ts` | Weighted scoring → A–F grade |
| Scan API | `src/app/api/audit/scan/route.ts` | POST endpoint with SSRF + rate limiting |
| Results page | `src/app/audit/[domain]/page.tsx` | Grade visualization, breakdown, cookie details |
| OG image | `src/app/api/og/[domain]/route.tsx` | Dynamic social sharing image |

**Scan Flow:**
1. Validate URL (Zod) → SSRF check (DNS resolve, private IP rejection)
2. Rate limit check (10/IP/hour, in-memory sliding window)
3. Cache lookup in `sl_audits` (24h TTL)
4. Launch Puppeteer (`@sparticuz/chromium` on Vercel, fallback chain locally)
5. Set request interception → block images/fonts/media for speed
6. Navigate with `networkidle2` + 2s extra wait for lazy-loaded trackers
7. Extract cookies, classify third-party domains against tracker DB
8. Compute weighted score → grade
9. Cache result, return

**Grading Weights:**
| Factor | Weight | Scale |
|--------|--------|-------|
| Third-party cookies | 25% | 0–200 cookies |
| Third-party domains | 20% | 0–50 domains |
| Session recording | 20% | Binary (present/absent) |
| Ad networks | 15% | 0–2 networks |
| Analytics trackers | 10% | 1–4 trackers |
| Server-side processing | 10% | Binary heuristic |

**Grade thresholds:** A ≥ 90, B ≥ 75, C ≥ 55, D ≥ 35, F < 35

### 2.2 File Converters (6 Categories)

All converters share the `useConverter` hook (`src/hooks/useConverter.ts`) for unified job queue, batch state, progress tracking, and download management.

#### Image Converter — ✅ Complete
- **Route:** `/convert/images`
- **Component:** `src/components/ImageConverter.tsx`
- **Input:** PNG, JPG, JPEG, WebP, AVIF, GIF, BMP, TIFF, TIF, HEIC, HEIF, SVG
- **Output:** WebP, PNG, JPG, AVIF
- **Features:** Quality slider (10–100%), resize presets + custom dimensions, aspect ratio lock
- **HEIC handling:** Canvas native decode → fallback to libheif-js WASM
- **SVG→raster:** Canvas render from `Image()` element
- **Max size:** 50 MB

#### Document Converter — ✅ Complete
- **Route:** `/convert/documents`
- **Component:** `src/components/DocumentConverter.tsx`
- **Conversions:**
  - DOCX → PDF (mammoth → pdf-lib) / TXT
  - PDF → TXT (pdfjs-dist, smart line-break detection) / JSON (structured metadata + pages)
  - CSV ↔ JSON (papaparse)
  - TXT → PDF (pdf-lib, word-wrap + font sizing)
  - XLSX → CSV / JSON / TXT (SheetJS)
- **Max size:** 25 MB

#### Audio Converter — ✅ Complete
- **Route:** `/convert/audio`
- **Component:** `src/components/AudioConverter.tsx`
- **Input:** MP3, WAV, OGG, AAC, FLAC, M4A, WMA
- **Output:** MP3, WAV, OGG, AAC, FLAC
- **Features:** Bitrate presets (128/192/256/320 kbps), trim start/end
- **Engine:** ffmpeg.wasm (~32 MB), lazy-loaded singleton
- **Max size:** 100 MB

#### Video Converter — ✅ Complete
- **Route:** `/convert/video`
- **Component:** `src/components/VideoConverter.tsx` (referenced in app route)
- **Input:** MP4, WebM, MOV, AVI, MKV, GIF
- **Output:** MP4 (H.264), WebM (VP9), GIF (palette)
- **Features:** Resolution presets (Original/1080p/720p/480p/360p), CRF quality slider (18–40), trim
- **Engine:** Same ffmpeg.wasm singleton as audio (shared `src/lib/ffmpeg.ts`)
- **iOS warning:** SharedArrayBuffer issues on Safari
- **Max size:** 500 MB

#### PDF Tools — ✅ Complete
- **Route:** `/convert/pdf-tools`
- **Component:** `src/components/tools/PdfMergeSplit.tsx`
- **Merge:** Drag-to-reorder multiple PDFs → concatenate via pdf-lib
- **Split:** Page range extraction with thumbnail preview via pdfjs-dist

#### ZIP/Unzip — ✅ Complete
- **Route:** `/convert/zip`
- **Component:** `src/components/tools/ZipTool.tsx`
- **Create:** Select files → build .zip via jszip
- **Extract:** Browse file tree, download individual files
- **Max size:** 200 MB

### 2.3 PDF Signer — ✅ Complete

**Route:** `/sign`
**Component:** `src/components/PDFSigner.tsx`

Client-side DocuSign alternative. The entire workflow runs in the browser — no server, no account.

- Upload PDF → pdfjs-dist renders preview pages to canvas
- Draw signature (canvas freehand), type signature, or upload image
- Place signature, text, date stamps at arbitrary positions on any page
- Fill form fields: text, checkbox, radio, dropdown (pdf-lib AcroForm APIs)
- Download modified PDF
- **Limitations:** Visual signatures only (no PKCS#7 cryptographic signing), XFA forms not supported

### 2.4 Developer & Privacy Tools (20 Tools)

All tools live under `/tools/*` with components in `src/components/tools/`.

#### Text & Data Processing
| # | Tool | Route | Component | Key Feature |
|---|------|-------|-----------|-------------|
| 1 | Base64 Encode/Decode | `/tools/base64` | `Base64Tool.tsx` | Text + file mode, auto-detect direction |
| 2 | JSON Formatter | `/tools/json` | `JsonFormatter.tsx` | Validate, pretty-print, minify, tree view, export CSV/YAML |
| 3 | Case Converter | `/tools/case` | `CaseConverter.tsx` | camelCase, snake_case, kebab-case, UPPERCASE, Title Case |
| 4 | Word Counter | `/tools/wordcount` | `WordCounter.tsx` | Words, chars, sentences, paragraphs, reading time |
| 5 | Regex Playground | `/tools/regex` | `RegexPlayground.tsx` | Real-time testing, match highlights, captured groups |
| 6 | SVG → React | `/tools/svg-to-react` | `SvgToReact.tsx` | Convert SVG to clean React JSX with TypeScript types |
| 7 | Invisible Char Detector | `/tools/invisible-chars` | `InvisibleCharDetector.tsx` | Zero-width, homoglyphs, bidi controls |
| 8 | Epoch Converter | `/tools/epoch` | `EpochConverter.tsx` | Unix ↔ ISO 8601 ↔ human dates, timezone support |
| 9 | JWT Decoder | `/tools/jwt` | `JwtDecoder.tsx` | Header, payload, claims, expiry status |

#### Cryptography & Encoding
| # | Tool | Route | Component | Key Feature |
|---|------|-------|-----------|-------------|
| 10 | Hash Calculator | `/tools/hash` | `HashCalculator.tsx` | MD5/SHA-1/SHA-256/SHA-512, file streaming |
| 11 | Password Generator | `/tools/password` | `PasswordGenerator.tsx` | Random + passphrase (EFF wordlist), zxcvbn strength |
| 12 | File Encryption | `/tools/encrypt` | `FileEncryptor.tsx` | AES-256-GCM, PBKDF2 key derivation, 100 MB max |
| 13 | QR Code Generator | `/tools/qr` | `QRGenerator.tsx` | URL/WiFi/vCard/text, PNG + SVG export |
| 14 | UUID Generator | `/tools/uuid` | `UuidGenerator.tsx` | V4 (crypto.randomUUID), bulk generation |

#### Privacy & Security
| # | Tool | Route | Component | Key Feature |
|---|------|-------|-----------|-------------|
| 15 | Browser Fingerprint | `/tools/fingerprint` | `FingerprintViewer.tsx` | Canvas, WebGL, fonts, screen, hardware; SHA-256 composite |
| 16 | Tracking Pixel Detector | `/tools/tracking-pixels` | `TrackingPixelDetector.tsx` | Paste email HTML → detect hidden pixels/beacons |
| 17 | EXIF Stripper | `/tools/exif` | `ExifStripper.tsx` | View + strip GPS/camera/timestamps, batch + ZIP |
| 18 | Clipboard Cleaner | `/tools/clipboard` | `ClipboardCleaner.tsx` | Strip tracking, inline styles, Office markup |

#### Design & Accessibility
| # | Tool | Route | Component | Key Feature |
|---|------|-------|-----------|-------------|
| 19 | CSS Gradient Generator | `/tools/gradient` | `GradientGenerator.tsx` | Linear/radial/conic, visual editor |
| 20 | Contrast Checker | `/tools/contrast` | `ContrastChecker.tsx` | WCAG 2.1 AA/AAA compliance |

### 2.5 Analytics Pipeline

**Status: ✅ Complete**

| Layer | File | Purpose |
|-------|------|---------|
| Client tracker | `src/lib/analytics.ts` | `trackEvent()` via `sendBeacon`, session ID in sessionStorage |
| Consent logic | `src/lib/consent.ts` | localStorage toggle, `hasOptedOut()` check |
| Event API | `src/app/api/analytics/event/route.ts` | POST, hashes IP, validates event type, stores raw |
| Aggregation cron | `src/app/api/analytics/aggregate/route.ts` | Daily at 03:00 UTC, groups by event+country, 30-day cleanup |
| Dashboard API | `src/app/api/dashboard/analytics/route.ts` | GET, 30-day rolling, Basic Auth protected |
| Dashboard UI | `src/components/admin/AnalyticsDashboard.tsx` | Custom SVG charts (no chart library) |
| Consent banner | `src/components/ConsentBanner.tsx` | Inline opt-in/out, no dark patterns |
| Privacy badge | `src/components/PrivacyBadge.tsx` | Footer indicator |
| Page tracker | `src/components/PageViewTracker.tsx` | Auto-fires `page_view` events |

**7 Event Types:** `page_view`, `tool_opened`, `tool_used`, `scan_initiated`, `scan_completed`, `report_shared`, `telemetry_opted_out`

**Privacy Guarantees:**
- IP hashed with salt (SHA-256, truncated to 16 chars), never stored raw
- Country from Vercel `x-vercel-ip-country` header only
- Session-based (ephemeral UUID in sessionStorage), not user-based
- Raw events auto-purged after 30 days
- `sendBeacon` = fire-and-forget, never blocks UI

---

## 3. Architecture

### 3.1 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata, analytics)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Tailwind @theme inline + animations
│   ├── icon.tsx                  # Dynamic favicon
│   ├── opengraph-image.tsx       # Default OG image
│   ├── api/
│   │   ├── audit/scan/route.ts   # Privacy scan endpoint
│   │   ├── analytics/
│   │   │   ├── event/route.ts    # Fire-and-forget event ingestion
│   │   │   └── aggregate/route.ts # Daily cron aggregation
│   │   ├── dashboard/analytics/route.ts # Admin data endpoint
│   │   └── og/[domain]/route.tsx # Dynamic OG image generation
│   ├── audit/[domain]/page.tsx   # Audit results page
│   ├── convert/
│   │   ├── layout.tsx            # COOP/COEP scoped layout
│   │   ├── page.tsx              # Converter hub
│   │   ├── images/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── audio/page.tsx
│   │   ├── video/page.tsx
│   │   ├── pdf-tools/page.tsx
│   │   └── zip/page.tsx
│   ├── sign/page.tsx             # PDF signer
│   ├── tools/
│   │   ├── layout.tsx            # Tools section layout
│   │   ├── page.tsx              # Tools browse grid
│   │   └── [20 tool routes]/page.tsx
│   └── dashboard/analytics/page.tsx  # Admin dashboard
├── components/
│   ├── ImageConverter.tsx        # Image conversion UI
│   ├── DocumentConverter.tsx     # Document conversion UI
│   ├── AudioConverter.tsx        # Audio conversion UI
│   ├── PDFSigner.tsx             # PDF signing & form filling
│   ├── AuditReport.tsx           # Audit result display
│   ├── ScanInput.tsx             # Domain input with validation
│   ├── ScanProgress.tsx          # Scan progress indicator
│   ├── GradeReveal.tsx           # Grade animation
│   ├── ReportCard.tsx            # Audit summary card
│   ├── DropZone.tsx              # Shared file upload component
│   ├── Header.tsx / Footer.tsx   # Site chrome
│   ├── ConsentBanner.tsx         # Analytics opt-in/out
│   ├── PrivacyBadge.tsx          # Footer privacy indicator
│   ├── PageViewTracker.tsx       # Auto page_view events
│   ├── ConverterTabs.tsx         # Converter navigation
│   ├── AnalyticsStatus.tsx       # Telemetry status
│   ├── admin/
│   │   └── AnalyticsDashboard.tsx # SVG charts dashboard
│   └── tools/
│       ├── [20 tool components].tsx
│       └── ToolPageHeader.tsx    # Reusable tool page header
├── hooks/
│   └── useConverter.ts           # Shared job queue hook
├── lib/
│   ├── scanner/
│   │   ├── index.ts              # scanUrl() orchestrator
│   │   ├── classify.ts           # Cookie + domain classification
│   │   └── trackers.ts           # 50+ tracker regex patterns
│   ├── tools/
│   │   ├── crypto.ts             # AES-256-GCM encrypt/decrypt
│   │   ├── invisible-chars.ts    # Unicode detection patterns
│   │   └── json-highlight.ts     # JSON syntax highlighting
│   ├── data/
│   │   └── eff-wordlist.json     # EFF passphrase wordlist
│   ├── analytics.ts              # trackEvent(), getSessionId()
│   ├── consent.ts                # hasOptedOut(), setOptOut()
│   ├── constants.ts              # Grade colors, rate limits, file size caps
│   ├── ffmpeg.ts                 # FFmpeg.wasm singleton loader
│   ├── grading.ts                # Weighted privacy scoring
│   ├── hash.ts                   # IP hashing (SHA-256 + salt)
│   ├── rate-limit.ts             # In-memory sliding window
│   ├── supabase.ts               # Supabase client (graceful null)
│   ├── types.ts                  # All TypeScript interfaces
│   └── validation.ts             # Zod URL schema + SSRF check
├── types/
│   ├── spark-md5.d.ts
│   └── libheif-js.d.ts
└── middleware.ts                 # HTTP Basic Auth for /dashboard
```

### 3.2 Supabase Schema (4 Tables)

```sql
-- sl_audits: Cached scan results (24h TTL)
CREATE TABLE sl_audits (
  id TEXT PRIMARY KEY,             -- slug e.g. "google-com"
  domain TEXT NOT NULL,
  display_url TEXT NOT NULL,
  grade TEXT NOT NULL,             -- A/B/C/D/F
  scores JSONB NOT NULL,           -- weighted score breakdown
  scan JSONB NOT NULL,             -- full ScanData
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL  -- cached_at + 24h
);
-- Indexes: domain, expires_at
-- RLS: public read, service-role write

-- sl_audit_requests: User audit request log
CREATE TABLE sl_audit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  requested_by_ip TEXT NOT NULL,   -- SHA-256 hashed, 16-char truncated
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Index: domain
-- RLS: public insert only

-- sl_analytics_events: Raw fire-and-forget events
CREATE TABLE sl_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  session_ip TEXT,                 -- hashed
  country TEXT,                    -- from Vercel header
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Indexes: event, created_at, session_id, country
-- RLS: service-role only
-- 30-day retention (cron cleanup)

-- sl_analytics_daily: Pre-aggregated daily rollup
CREATE TABLE sl_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  event TEXT NOT NULL,
  country TEXT DEFAULT 'unknown',
  count INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  UNIQUE(date, event, country)     -- upsert target
);
```

### 3.3 Middleware & Security

**HTTP Basic Auth** (`src/middleware.ts`):
- Protects `/dashboard/*` and `/api/dashboard/*`
- Returns 503 if `AUTH_USER`/`AUTH_PASSWORD` not configured
- Standard `WWW-Authenticate: Basic` challenge on 401

**SSRF Prevention** (`src/lib/validation.ts`):
- Zod validation → HTTPS enforcement
- DNS resolution of hostname → check all resolved IPs
- Blocks: `127.x`, `10.x`, `172.16-31.x`, `192.168.x`, `169.254.x`, `0.x`, `::1`, `fc00:`, `fe80:`, `fd*`
- Explicit rejection of `localhost`, `0.0.0.0`
- DNS failure = blocked (fail-safe)

**Rate Limiting** (`src/lib/rate-limit.ts`):
- In-memory sliding window: 10 scans/IP/hour
- Auto-cleanup every 5 minutes (prevents memory leak)
- Returns `{ limited, retryAfter }` for HTTP 429 + `Retry-After` header
- Non-persistent (resets on deployment) — acceptable tradeoff for serverless

**COOP/COEP Headers** (`next.config.ts`):
- Scoped to `/convert/*` only via `async headers()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- Required for `SharedArrayBuffer` (ffmpeg.wasm needs it)
- Would break third-party resources (e.g., Google Fonts) if applied globally

**Vercel Function Config** (`vercel.json`):
- Audit scan: 1024 MB memory, 60s timeout (Pro plan)
- Analytics aggregate: Daily cron at 03:00 UTC via `CRON_SECRET` bearer auth

### 3.4 Key Architectural Patterns

**FFmpeg Singleton** (`src/lib/ffmpeg.ts`):
- Single shared instance for audio + video converters
- Prevents downloading the ~32 MB WASM binary twice
- Concurrent load protection via promise deduplication
- Loads from unpkg CDN via blob URLs to bypass COEP restrictions
- Error recovery: resets state on failure so next caller can retry

**useConverter Hook** (`src/hooks/useConverter.ts`):
- Generic job queue accepting any `ConvertFn`
- Sequential processing to avoid memory pressure (one job at a time)
- Derived batch state: `pendingCount`, `doneCount`, `processingCount`, `isBatchComplete`
- Staggered `downloadAll()` (300ms between downloads to avoid browser popup blockers)
- Functional state setter to avoid stale closure bugs in `processAll()`

**Supabase Graceful Null** (`src/lib/supabase.ts`):
- `getSupabase()` returns `null` if env vars missing
- All API routes check for null → return 503 with helpful message
- Enables local development without Supabase configured

**Fire-and-Forget Analytics** (`src/lib/analytics.ts`):
- `navigator.sendBeacon()` for page unload resilience
- Fallback to `fetch({ keepalive: true })`
- Errors swallowed — never blocks UI or throws

---

## 4. Debug Trail & Fixes

Every significant bug encountered and resolved during development, in chronological order:

### 4.1 pdfjs-dist v5 → v4.10.38 Downgrade
**Commit:** `6e87951`
**Symptom:** `Map.prototype.getOrInsertComputed is not a function` at runtime in the browser.
**Root cause:** pdfjs-dist v5 uses `Map.prototype.getOrInsertComputed`, a Stage 3 TC39 proposal not yet shipped in any browser engine. The method exists in V8 (Node.js 23+) but not in Chrome/Firefox/Safari.
**Fix:** Pin to `pdfjs-dist@4.10.38` (last v4 release). V5 won't be viable until browsers ship the method.

### 4.2 PDF Worker CDN 404s
**Commits:** `a205ce8`, `a6b0ea4`
**Symptom:** PDF viewer shows blank pages. Console: 404 loading `pdf.worker.min.mjs` from cdnjs.
**Root cause:** cdnjs didn't host the exact version/path combination. Also, `toBlobURL` from `@ffmpeg/util` was being used for the PDF worker, but it's meant for ffmpeg — different URL patterns.
**Fix:** Switch PDF worker CDN to jsDelivr (`https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`). Use direct URL string instead of `toBlobURL`. Added explicit `canvasContext` for the render call.

### 4.3 Detached ArrayBuffer in WASM
**Symptom:** `TypeError: Cannot perform Construct on a detached ArrayBuffer` when processing the second file in a batch.
**Root cause:** When you pass an `ArrayBuffer` to ffmpeg.wasm's `writeFile()`, the WASM runtime transfers ownership (detaches it). The original reference becomes unusable. If you try to reuse it or if React re-renders and accesses the stale reference, it throws.
**Fix:** Always `.slice(0)` the ArrayBuffer before passing to WASM. This creates a copy, keeping the original intact. Applied in both audio and video converters.

### 4.4 COOP/COEP Scoping
**Symptom:** Third-party fonts and scripts broken across the entire site when COOP/COEP headers were set globally.
**Root cause:** `Cross-Origin-Embedder-Policy: require-corp` blocks any cross-origin resource that doesn't include a `Cross-Origin-Resource-Policy` header. Most CDNs (Google Fonts, etc.) don't set this header.
**Fix:** Scope COOP/COEP to `/convert/*` only in `next.config.ts` `headers()`. Only converter pages need `SharedArrayBuffer` (ffmpeg.wasm). All other pages load normally.

### 4.5 FFmpeg Double-Download Prevention
**Symptom:** Navigating between audio and video converter tabs triggered a second 32 MB WASM download.
**Root cause:** Each converter component was creating its own FFmpeg instance.
**Fix:** Extract `getFFmpeg()` into a shared singleton at `src/lib/ffmpeg.ts`. Module-level `ffmpegInstance` variable persists across component lifecycle. Added concurrent-load protection: if a second caller requests FFmpeg while the first is still loading, it awaits the existing promise instead of starting a new download.

### 4.6 Batch Download Popup Blocker
**Symptom:** "Download All" only downloads the first 1–2 files when batch has 5+.
**Root cause:** Browsers detect rapid programmatic link clicks as popup spam and silently block them.
**Fix:** Stagger downloads with 300ms delay between each `link.click()` call in `downloadAll()`. The delay is long enough for browsers to process each download without triggering the blocker.

### 4.7 Scanner 2-Second Delay for Lazy Trackers
**Symptom:** Some sites showed 0 trackers despite clearly having analytics (e.g., Google Analytics loaded via GTM defer).
**Root cause:** `networkidle2` fires when there are ≤2 active network connections for 500ms, but many tracker scripts load lazily after DOMContentLoaded — via `defer`, `async`, `setTimeout`, or intersection observer triggers.
**Fix:** Added a 2-second `setTimeout` after `networkidle2` in `scanUrl()`. This catches late-loading trackers without significantly impacting scan time (total scan is ~8–15s anyway).

### 4.8 Admin Route Rename
**Commit:** `1ce3ff5`
**Change:** Renamed `/admin` → `/dashboard` for all admin routes. Updated middleware matcher accordingly.

---

## 5. Technical Insights & Patterns

### 5.1 ArrayBuffer Transfer Semantics in Web Workers

When you pass an `ArrayBuffer` to a WASM module or Web Worker via `postMessage` with transferable objects, the browser **transfers ownership** — the original ArrayBuffer becomes "detached" (zero-length, unusable). This is a performance optimization (zero-copy transfer) but it's a footgun in React where components may re-render and access stale references.

**Pattern:** Always `.slice(0)` before passing ArrayBuffers to WASM. The copy overhead is negligible compared to the WASM processing time.

### 5.2 SharedArrayBuffer + COOP/COEP for WASM

ffmpeg.wasm requires `SharedArrayBuffer` for multi-threaded WASM execution. Browsers only expose `SharedArrayBuffer` when the page has these headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

But COEP (`require-corp`) blocks any cross-origin resource that doesn't include `Cross-Origin-Resource-Policy: cross-origin`. This breaks Google Fonts, analytics scripts, CDN images, etc.

**Pattern:** Scope these headers to only the routes that need them (`/convert/*`). Load WASM via blob URLs (`toBlobURL`) to bypass the COEP restriction on the CDN fetch.

### 5.3 Puppeteer Browser Launch Fallback Chain

The scanner needs Chromium, but the binary source differs by environment:
1. **Vercel:** `@sparticuz/chromium` ships a compressed binary (~50 MB → ~130 MB uncompressed) that fits in a serverless function. Cold start adds 5–8s for decompression.
2. **Local dev with puppeteer:** The `puppeteer` dev dependency bundles its own Chromium.
3. **Local dev without puppeteer:** Fall back to system Chrome at known paths (macOS, Linux, Windows).

**Pattern:** Try each option in order, catching errors and falling through. The `try/catch` fallback chain in `getBrowser()` handles all three seamlessly.

### 5.4 Graceful Null for Optional Services

Supabase is optional — the app should work without it (local dev, demo mode).

**Pattern:** `getSupabase()` returns `null` if env vars are missing. Every API route that uses Supabase checks:
```typescript
const supabase = getSupabase();
if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
```
This prevents crashes and gives a clear signal to the caller.

### 5.5 Fire-and-Forget Analytics via sendBeacon

`navigator.sendBeacon()` is designed for analytics: it queues a POST request that survives page unloads (navigations, tab closes). Unlike `fetch`, it doesn't return a response — true fire-and-forget.

**Pattern:** Use `sendBeacon` as primary, `fetch({ keepalive: true })` as fallback. Swallow all errors. Never `await` the result. Check consent (`hasOptedOut()`) before sending.

### 5.6 Sequential Batch Processing

Processing multiple files simultaneously (e.g., 5 video conversions) can exhaust browser memory (each ffmpeg instance holds the full file + output in WASM memory).

**Pattern:** Process jobs sequentially in `processAll()` with a simple `for...of` loop and `await`. Use a functional state setter (`setJobs(current => ...)`) to read latest state and avoid stale closures. Show progress as "Converting 3 of 5..." to keep users informed.

### 5.7 In-Memory Rate Limiting for Serverless

Traditional rate limiters use Redis. For a serverless function that doesn't need persistent state:

**Pattern:** Module-level `Map<string, number[]>` storing timestamps per IP. Sliding window: filter out entries older than the window, check remaining count. Auto-cleanup every 5 minutes to prevent unbounded growth. Resets on cold start — acceptable because the protection is against casual abuse, not determined attackers.

---

## 6. Known Gaps & Tech Debt

### No Automated Tests
- Zero unit tests, integration tests, or E2E tests
- The `useConverter` hook and grading algorithm are prime candidates for unit testing
- Scanner would benefit from integration tests with mock Puppeteer
- Risk: Regressions in grading weights, converter options, or SSRF validation

### No Undo/Redo in PDF Signer
- Once a signature or text is placed, there's no way to undo
- Current workaround: re-upload the original PDF
- Should add an undo stack for placed elements

### DOCX → PDF Loses Formatting
- mammoth converts DOCX to HTML (semantic only — paragraphs, headings, lists)
- pdf-lib receives plain text, losing all formatting
- Tables, images, fonts, colors, and complex layouts are stripped
- Proper fix would require a DOCX rendering engine (none exist client-side in JS)

### Simplified Base Domain Extraction
- Third-party domain detection uses simple hostname comparison
- Doesn't use the Public Suffix List (PSL) for accurate eTLD+1 extraction
- Example: `tracker.co.uk` vs `site.co.uk` — both have `.co.uk` as eTLD but current code might misclassify
- Real-world impact is low (most trackers use distinct domains) but technically incorrect

### Manual Tracker Database Maintenance
- The 50+ tracker patterns in `trackers.ts` are hardcoded
- New trackers require code changes and redeployment
- No auto-update mechanism or community contribution pipeline
- Should consider a remote tracker list with periodic sync

### Hardcoded Conversion Options
- GIF framerate: fixed at 10fps
- Audio bitrate presets: 128/192/256/320 — no custom input
- Video CRF range: 18–40 — reasonable but no advanced codec options
- These are intentional simplifications but limit power users

### Rate Limiter Not Persistent
- In-memory rate limiter resets on every Vercel cold start
- A determined user could bypass by waiting for a new function instance
- Acceptable for current scale; would need Redis/Upstash for production-grade limiting

### No wasm-vips Usage
- CLAUDE.md mentions wasm-vips for image conversion but the current implementation uses Canvas API + libheif-js
- wasm-vips would provide higher quality resizing (Lanczos) and broader format support
- Currently works fine without it

---

## 7. Roadmap Position

### Phase 1 — "Ship the Wow": ✅ COMPLETE (~31 features)

| Group | Description | Status |
|-------|-------------|--------|
| **A** | Converter completeness (PDF→JSON, image resize, XLSX, SVG→raster, video) | ✅ All 5 done |
| **B** | Done-state UX (batch progress bar, completion banner, animations) | ✅ All 4 done |
| **C** | PDF signing (client-side DocuSign alternative) | ✅ Done |
| **D** | PRD Phase 1 unbuilt (EXIF, encryption, hash, QR, JSON, password, Base64, UUID, PDF merge/split, ZIP) | ✅ All 10 done |
| **E** | Extended ideas (fingerprint viewer, tracking pixel detector, invisible chars, clipboard cleaner, epoch, JWT) | ✅ All 6 done |
| **F** | Transparent telemetry (event tracker, receiver, consent, schema) | ✅ All 4 done |

**Additionally built (not originally in Phase 1 plan):**
- Contrast Checker (WCAG 2.1)
- CSS Gradient Generator
- SVG → React Component
- Regex Playground
- Word/Character Counter
- Case Converter

These 6 tools were originally Phase 2 Group G items but were pulled forward.

### Phase 2 — "Expand the Platform": 🔜 NOT STARTED

| Group | Description | Items |
|-------|-------------|-------|
| **F** | AI/ML features | Background removal, speech-to-text, image upscaling, face detection/blur, depth maps |
| **G** | Developer power tools | Code screenshot, favicon gen, diff viewer, JSON↔YAML↔TOML, cron builder, color palette, markdown editor |
| **H** | Privacy brand tools | Document redactor, email header analyzer, file signature checker, universal metadata, privacy policy analyzer |
| **I** | PRD Phase 2 | Safe Stack Directory, comparison mode, scheduled re-scans |
| **J** | Additional dev utilities | SQL formatter, IP tools, chmod calc, URL parser, HTML entities, base converter, unit converter, user-agent parser, .env validator, robots.txt generator, CSP builder |
| **K** | Analytics infrastructure | Daily aggregation cron ✅ (already built), admin dashboard ✅ (already built) |

**Note:** Group K (analytics infrastructure) was built during Phase 1 alongside the telemetry system.

### Phase 3 — "Full Platform": 📋 PLANNED

| Group | Description |
|-------|-------------|
| **L** | AI/ML extended (YOLO, translation, summarization, sentiment, NER, captioning, pose estimation) |
| **M** | Full applications (SQLite explorer, Python playground, spreadsheet, whiteboard, e-book reader, photo/audio/screen recording) |
| **N** | Growth & distribution (browser extension, community leaderboard, public API) |
| **O** | Public transparency dashboard |
| **P** | Fun/niche tools (music visualizer, ASCII art, morse code, metronome, etc.) |

---

## 8. Dependencies

### Runtime Dependencies

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `next` | 16.1.6 | Framework (App Router, Turbopack) | Core |
| `react` / `react-dom` | 19.2.3 | UI library | Core |
| `@supabase/supabase-js` | ^2.98.0 | Database client | ~50KB |
| `@ffmpeg/ffmpeg` | ^0.12.10 | Audio/video WASM engine | ~32MB (lazy) |
| `@ffmpeg/util` | ^0.12.2 | FFmpeg utilities (toBlobURL) | ~5KB |
| `@sparticuz/chromium` | ^133.0.0 | Compressed Chromium for Vercel | Server-only |
| `puppeteer-core` | ^24.0.0 | Headless browser API | Server-only |
| `@vercel/og` | ^0.6.0 | OG image generation (Edge) | Edge-only |
| `pdf-lib` | ^1.17.1 | PDF creation/modification | ~300KB |
| `pdfjs-dist` | ^4.10.38 | PDF rendering/text extraction | ~800KB |
| `mammoth` | ^1.8.0 | DOCX → HTML | ~150KB |
| `papaparse` | ^5.5.0 | CSV parsing | ~50KB |
| `xlsx` | ^0.18.5 | Excel file parsing | ~300KB |
| `jszip` | ^3.10.1 | ZIP creation/extraction | ~100KB |
| `libheif-js` | ^1.19.8 | HEIC/HEIF decoding (WASM) | ~2MB (lazy) |
| `exifr` | ^7.1.3 | EXIF metadata extraction | ~50KB |
| `qrcode` | ^1.5.4 | QR code generation | ~50KB |
| `zxcvbn` | ^4.4.2 | Password strength estimation | ~400KB (lazy) |
| `spark-md5` | ^3.0.2 | MD5 hashing | ~10KB |
| `js-yaml` | ^4.1.1 | YAML parser | ~30KB |
| `html-to-image` | ^1.11.13 | HTML → image conversion | ~20KB |
| `nanoid` | ^5.1.6 | ID generation | ~1KB |
| `zod` | ^3.24.0 | Schema validation | ~50KB |
| `lucide-react` | ^0.575.0 | Icons (tree-shaken) | ~5KB used |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer` | ^24.38.0 | Local dev browser (bundles Chromium) |
| `tailwindcss` | ^4.1.0 | CSS framework |
| `@tailwindcss/postcss` | ^4.1.0 | PostCSS plugin |
| `typescript` | ^5.8.0 | Type checking |
| `@types/*` | Various | Type definitions for js-yaml, papaparse, qrcode, react, react-dom, zxcvbn |

---

## 9. Key Files Reference

### Configuration
| File | Purpose |
|------|---------|
| `next.config.ts` | Server external packages, COOP/COEP headers |
| `vercel.json` | Function memory/timeout, cron schedule |
| `tsconfig.json` | TypeScript strict, `@/*` path alias |
| `postcss.config.mjs` | Tailwind PostCSS plugin |
| `package.json` | Dependencies, scripts |
| `CLAUDE.md` | AI assistant project context |
| `ROADMAP.md` | 3-phase expansion plan |

### Core Logic
| File | Purpose |
|------|---------|
| `src/lib/scanner/index.ts` | `scanUrl()` — Puppeteer scan orchestrator |
| `src/lib/scanner/trackers.ts` | Tracker regex database (50+ patterns) |
| `src/lib/scanner/classify.ts` | Cookie + domain classification |
| `src/lib/grading.ts` | Privacy scoring algorithm |
| `src/lib/validation.ts` | URL validation + SSRF prevention |
| `src/lib/rate-limit.ts` | In-memory sliding window rate limiter |
| `src/lib/ffmpeg.ts` | FFmpeg.wasm singleton loader |
| `src/lib/analytics.ts` | Client-side event tracking |
| `src/lib/consent.ts` | Opt-out consent management |
| `src/lib/supabase.ts` | Supabase client (graceful null) |
| `src/lib/hash.ts` | IP hashing (SHA-256 + salt) |
| `src/lib/constants.ts` | Grade colors, rate limits, file size caps |
| `src/lib/types.ts` | All TypeScript interfaces |
| `src/lib/tools/crypto.ts` | AES-256-GCM encrypt/decrypt |
| `src/hooks/useConverter.ts` | Shared conversion job queue |
| `src/middleware.ts` | HTTP Basic Auth for admin routes |

### Key Components
| File | Purpose |
|------|---------|
| `src/components/PDFSigner.tsx` | Full PDF signing + form fill UI |
| `src/components/ImageConverter.tsx` | Image conversion + resize |
| `src/components/DocumentConverter.tsx` | Document format conversion |
| `src/components/AudioConverter.tsx` | Audio conversion + trim |
| `src/components/AuditReport.tsx` | Privacy audit result display |
| `src/components/DropZone.tsx` | Shared file upload UI |
| `src/components/admin/AnalyticsDashboard.tsx` | Custom SVG analytics charts |

### Database
| File | Purpose |
|------|---------|
| `supabase/migrations/20260304193001_create_sl_audits.sql` | Audit cache table |
| `supabase/migrations/20260304193002_create_sl_audit_requests.sql` | Audit request log |
| `supabase/migrations/20260304193003_create_st_analytics.sql` | Raw analytics events |
| `supabase/migrations/20260305120001_add_analytics_session_country.sql` | Session + country columns |
| `supabase/migrations/20260305120002_create_sl_analytics_daily.sql` | Daily aggregation table |

---

## 10. Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `SUPABASE_URL` | For DB features | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB features | — | Supabase admin key |
| `IP_HASH_SALT` | No | `"shiplocal-salt-2026"` | Salt for IP privacy hashing |
| `AUTH_USER` | For admin | — | Dashboard HTTP Basic Auth username |
| `AUTH_PASSWORD` | For admin | — | Dashboard HTTP Basic Auth password |
| `CRON_SECRET` | For analytics | — | Bearer token for aggregate cron |
| `VERCEL` | Auto-set | — | Environment detection (Chromium strategy) |

---

## 11. Commit History

```
6e87951 fix(shiplocal): Downgrade pdfjs-dist v5 → v4.10.38 for browser compat
a205ce8 fix(shiplocal): Fix PDF render - switch worker CDN to jsdelivr, add canvasContext
298da73 feat(shiplocal): Add Phase 2 tools — contrast, gradient, SVG→React, regex, wordcount, case
a6b0ea4 fix(shiplocal): Replace toBlobURL with direct CDN for pdfjs worker
1ce3ff5 fix(shiplocal): Fix PDF signer, footer logo, video trimming; rename /admin to /dashboard
9fb66d3 feat(shiplocal): Hide audit, redesign homepage, add analytics pipeline + admin dashboard
27678da feat(shiplocal): Update metadata, add analytics roadmap, speed up video converter
b125cb4 feat(shiplocal): Move PDF/ZIP to /convert, fix audit scanner, rebrand logo
d015324 feat(shiplocal): Add 16 developer/privacy tools with unified design system
ba5371f feat(shiplocal): Add video converter, PDF signer, batch UX, and converter expansions
49ab4b5 fix: add missing @types/react and @types/react-dom to devDependencies
2710c00 chore: rename migrations with Supabase timestamps and push to remote
656e358 feat: ShipLocal Phase 1 MVP — privacy auditor & local file converter
```
