# PRD: ShipTools — Privacy Auditor & Browser-Native Toolkit

**Version:** 1.1
**Date:** March 4, 2026
**Table Prefix:** `st_`
**Status:** Ready for build

---

## 1. Problem & Angle

### Problem
Every developer and builder regularly uses free online tools — file converters, PDF editors, image compressors, background removers. These tools are free because the user IS the product. A viral Reddit post on r/YouShouldKnow revealed that iLovePDF sets 637 cookies from 221 domains on a single visit. SmallPDF loads session recording (Hotjar) before you even upload a file. Most builders know this intellectually but have never seen the numbers.

There's no easy way to audit the privacy cost of the free tools you use daily, and no single place that offers the safe local alternative.

### Unique Angle
ShipTools is **two products in one**: a privacy auditor that generates shareable report cards for any free tool (the viral hook), and a comprehensive browser-native toolkit — file converters, encryption, developer utilities, metadata stripping, and more — that never uploads your files (the utility that keeps people coming back).

The audit is the distribution engine. The toolkit is the retention engine. ~76 tools, all running 100% in the browser, zero uploads, zero tracking.

### Who Is This For
Developers, indie hackers, and technical builders who use free online tools daily and care enough about privacy to switch — but only if the alternative is just as easy. Secondary: security-conscious professionals (lawyers, accountants) who upload sensitive documents to free tools.

**Primary audience: builder community** — launched through LinkedIn, HN, dev-focused Reddit.

---

## 2. Core Features (Phased)

### Phase 1 — MVP (1 sprint)

**F1: Privacy Audit Scanner**
- User pastes any URL (e.g., `ilovepdf.com`)
- Headless Puppeteer on Vercel serverless loads the page in a sandboxed browser
- Scans and returns:
  - Total cookies set (first-party + third-party)
  - Number of unique third-party domains contacted
  - Session recording detected (Hotjar, FullStory, LogRocket, Mouseflow, Smartlook)
  - Ad networks present (Google Ads, Meta Pixel, Amazon Ads, etc.)
  - Analytics trackers (GA4, Mixpanel, Amplitude, Segment, etc.)
  - Whether the tool processes files server-side vs locally
  - SSL/HTTPS status
- Generates a **letter grade (A–F)** based on weighted scoring
- **Acceptance criteria:**
  - Scan completes in <15 seconds
  - Results cached in Supabase (don't re-scan same domain within 24 hours)
  - Graceful handling of sites that block headless browsers (return partial results + disclaimer)
  - Rate limited: 10 scans per IP per hour (prevent abuse)

**F2: Shareable Report Card**
- Auto-generated visual report card for every audit
- Contains: tool name/logo (favicon), letter grade (large), cookie count, tracker count, top 5 third-party domains, "Scanned by ShipTools" branding
- Rendered as a downloadable PNG (via html-to-image or canvas API)
- Optimized for Twitter/LinkedIn sharing (1200×630 OG image dimensions)
- One-click copy link that loads the audit result page
- **Acceptance criteria:**
  - Report card image generates in <3 seconds
  - Shareable URL format: `shiptools.dev/audit/{domain-slug}`
  - OG meta tags auto-populated per audit so link previews show the grade

**F3: Local Image Converter (WASM)**
- Browser-only image conversion — nothing uploaded, all client-side
- Supported conversions: WEBP ↔ PNG ↔ JPEG ↔ GIF ↔ AVIF ↔ TIFF ↔ BMP ↔ SVG (raster)
- Batch support: drag-and-drop multiple files, convert all at once
- Quality/compression slider for lossy formats (JPEG, WEBP, AVIF)
- Resize option (scale %, or set max width/height)
- Uses `wasm-vips` (libvips compiled to WebAssembly) for fast processing
- **Acceptance criteria:**
  - Converts a 5MB image in <5 seconds on modern hardware
  - Shows "All processing happens in your browser. No files are uploaded." prominently
  - WASM module lazy-loaded (not in initial bundle)
  - Works offline after first load

**F4: Local Document Converter (WASM)**
- Browser-only document conversion via `pdf-lib` + `mammoth.js` + `docx` libraries
- Supported conversions:
  - PDF → text extraction
  - DOCX → PDF (via mammoth → HTML → pdf generation)
  - DOCX → HTML → Markdown
  - Markdown → HTML
  - HTML → PDF
  - CSV ↔ JSON
- **Acceptance criteria:**
  - Handles files up to 25MB
  - Clear messaging about which conversions are "full fidelity" vs "best effort" (e.g., complex DOCX layouts may simplify)
  - Download converted file with single click

**F5: Local Audio Converter (WASM)**
- Browser-only audio conversion via `ffmpeg.wasm`
- Supported conversions: MP3 ↔ WAV ↔ OGG ↔ AAC ↔ FLAC ↔ M4A
- Bitrate selector for lossy formats
- Basic trim (set start/end time before converting)
- **Acceptance criteria:**
  - Handles files up to 50MB
  - Progress bar during conversion (ffmpeg.wasm supports progress callbacks)
  - ffmpeg.wasm loaded on-demand only when user navigates to audio tab
  - Initial WASM load ~25MB — show clear loading indicator with "Loading converter engine…"

**F6: EXIF / Metadata Stripper**
- Strip GPS coordinates, camera info, timestamps, software tags from images before sharing
- Supports JPEG, PNG, TIFF, WebP (EXIF, IPTC, XMP data)
- Shows a **"What's hidden in your photo"** preview: map pin for GPS, camera model, timestamp, software — then strips it all
- Uses `exif-js` for reading + Canvas API for writing clean image (pure JS, no WASM)
- **Acceptance criteria:**
  - Shows all found metadata fields before stripping (the "reveal" is the shareable moment)
  - Batch support: drag multiple images, strip all at once
  - Download cleaned images individually or as ZIP (via JSZip)
  - Zero dependencies beyond exif-js (~50KB)

**F7: File Encryption / Decryption**
- AES-256-GCM encrypt any file with a password, entirely in-browser
- Uses native Web Crypto API — zero external dependencies, zero WASM
- Encrypt: user picks file + sets password → downloads `.enc` file
- Decrypt: user picks `.enc` file + enters password → downloads original
- **Acceptance criteria:**
  - Uses PBKDF2 key derivation (100K iterations) for password → key
  - Handles files up to 100MB
  - Clear error on wrong password (GCM auth tag fails gracefully)
  - No file size limit display issues — streams large files via ReadableStream if supported

**F8: Hash Calculator**
- Calculate MD5, SHA-1, SHA-256, SHA-512 for any file or text input
- Uses native Web Crypto API for SHA variants, `spark-md5` (~10KB) for MD5
- Drag-and-drop file or paste text → instant hash output
- "Verify" mode: paste expected hash + drop file → green check or red X
- **Acceptance criteria:**
  - Streams large files (doesn't load entire file into memory)
  - Copy-to-clipboard on each hash value
  - Handles files up to 2GB via chunked FileReader

**F9: QR Code Generator**
- Generate QR codes from: plain text, URLs, WiFi credentials (SSID/password), vCard contacts, email, phone, SMS
- Customizable: size, error correction level, foreground/background color
- Download as PNG or SVG
- Uses `qrcode` npm package (~50KB, pure JS)
- **Acceptance criteria:**
  - Live preview updates as user types
  - WiFi QR generates correct `WIFI:T:WPA;S:ssid;P:password;;` format
  - SVG export is clean vector (not rasterized)

**F10: JSON Formatter / Validator**
- Paste or upload JSON → pretty-print, validate, minify, or convert to other formats
- Syntax highlighting with error line/column indicators
- Tree view for exploring nested structures
- Convert JSON → CSV, JSON → YAML (via js-yaml, ~30KB)
- Pure JS — zero dependencies for core formatting (JSON.parse/stringify)
- **Acceptance criteria:**
  - Handles JSON files up to 10MB without freezing (Web Worker for parsing)
  - Error messages show exact line/column of syntax issue
  - Copy formatted output with one click

**F11: Password Generator**
- Cryptographically secure random passwords using Web Crypto API (`crypto.getRandomValues`)
- Configurable: length, uppercase, lowercase, numbers, symbols, no ambiguous characters
- Passphrase mode: generate memorable multi-word passphrases (EFF wordlist, ~8KB)
- Strength meter using `zxcvbn` (~400KB, lazy loaded)
- **Acceptance criteria:**
  - One-click copy to clipboard
  - Generate 10 passwords at once for bulk selection
  - Passphrase uses EFF's long wordlist (7,776 words)
  - Strength meter shows estimated crack time

**F12: Base64 Encode / Decode**
- Encode text or files to Base64, decode Base64 back to text or files
- Auto-detect: paste Base64 → shows decoded output, paste text → shows encoded output
- File mode: drag any file → get Base64 string (useful for data URIs, email attachments)
- Pure JS — native `btoa`/`atob` + FileReader for binary
- **Acceptance criteria:**
  - Handles files up to 25MB
  - Shows output size + percentage increase
  - Copy Base64 string with one click
  - Auto-detects if input is valid Base64

**F13: UUID Generator**
- Generate UUID v4 (random) using `crypto.getRandomValues`
- Bulk mode: generate 1–100 UUIDs at once
- Format options: standard (hyphenated), no hyphens, uppercase, braces
- Pure JS — zero dependencies (native Web Crypto)
- **Acceptance criteria:**
  - One-click copy individual or all UUIDs
  - Download as .txt for bulk generation

**F14: PDF Merge / Split**
- Merge: combine multiple PDFs into one (drag to reorder)
- Split: extract specific page ranges from a PDF
- Uses `pdf-lib` (already loaded for document conversion in F4)
- **Acceptance criteria:**
  - Drag-and-drop reordering for merge
  - Page range selector with thumbnail preview for split
  - Handles PDFs up to 50MB total
  - Zero incremental bundle cost (pdf-lib already in F4)

**F15: ZIP / Unzip**
- Create ZIP archives from multiple files
- Extract ZIP archives and download individual files or all
- Uses `JSZip` (~100KB, pure JS)
- Shows file tree with sizes before extraction
- **Acceptance criteria:**
  - Handles ZIP files up to 200MB
  - Shows progress for large archives
  - Supports nested folder structures
  - Download individual files from archive without extracting all

### Phase 2 — Polish & Directory (1 sprint)

**F16: Safe Stack Directory**
- Curated, searchable database of 30+ popular free tools, each with a ShipTools privacy grade
- Categories: File Conversion, PDF Tools, Image Editing, Background Removal, AI Writing, Resume Builders, Video Compression, Code Formatters
- Each tool page shows: full audit results, grade, last scanned date, alternatives (including ShipTools's own converter where applicable)
- SEO-optimized pages: `shiptools.dev/tool/{tool-name}` — targets "is [tool] safe?" search queries
- Users can request tools to be audited (upvote queue stored in Supabase)
- **Acceptance criteria:**
  - Launch with 30 tools pre-audited
  - Each tool page has proper OG tags, meta description
  - Audit request queue visible to users

**F17: Comparison Mode**
- Side-by-side comparison of 2–3 tools (e.g., iLovePDF vs SmallPDF vs ShipTools)
- Shareable comparison URL: `shiptools.dev/compare/{tool1}-vs-{tool2}`
- Auto-generates comparison image for social sharing
- **Acceptance criteria:**
  - Comparison loads from cached audit data (no live re-scan)
  - Comparison image renders with both grades side by side

**F18: Video Converter**
- Add video conversion to the local converter: MP4 ↔ WEBM ↔ MOV ↔ GIF
- Compression/quality presets (Web, Social Media, Archive)
- Basic trim before converting
- Uses ffmpeg.wasm (already loaded for audio)
- **Acceptance criteria:**
  - Handles files up to 200MB
  - Shows real-time progress with ETA
  - Warning for very large files about processing time

**F19: Scheduled Re-Scans**
- Cron job re-scans all tools in the directory weekly
- Tracks grade changes over time (did iLovePDF get better or worse?)
- "Grade History" chart on each tool page
- Alert system: if a tool's grade drops, flag it in the directory
- **Acceptance criteria:**
  - Weekly cron via Vercel cron or Supabase pg_cron
  - Grade history stored with timestamps
  - Visual timeline/sparkline on tool pages

### Phase 3 — Growth & Distribution (1 sprint)

**F20: Browser Extension**
- Chrome extension that shows a small ShipTools badge when visiting known free tool sites
- Badge displays the tool's letter grade
- Click to see full audit + "Use ShipTools instead" CTA
- **Acceptance criteria:**
  - Loads grade data from cached API, no full scan on each visit
  - Works on Chrome and Edge
  - Minimal permissions requested

**F21: "What Did They See?" Mode**
- User enters a tool they've already used
- ShipTools shows exactly what trackers were running, what data was likely collected
- Educational, slightly alarming — designed for sharing
- **Acceptance criteria:**
  - Presents findings in human-readable narrative, not just data dumps
  - Includes "what to do now" recommendations (clear cookies, use local tools next time)

**F22: Community Leaderboard**
- "Safest Free Tools of 2026" — auto-generated rankings from audit data
- "Most Invasive Free Tools of 2026" — the hall of shame
- Monthly refresh
- Embeddable badge: tools that score A can display "ShipTools Verified" on their site
- **Acceptance criteria:**
  - Leaderboard page with category filters
  - Shareable as standalone content
  - Embeddable badge with verification API

**F23: API Access**
- Public API for developers to check a tool's ShipTools grade programmatically
- Free tier: 100 lookups/day (cached results only, no live scans)
- Useful for: security teams, privacy-focused companies, browser extension developers
- **Acceptance criteria:**
  - RESTful API: `GET /api/v1/audit/{domain}` returns grade + summary
  - API key via Supabase auth
  - Rate limited per key

---

## 3. Design Direction

### Visual Mood
**"Security terminal meets editorial trust."** Think: dark-mode data dashboard that feels authoritative and trustworthy, not paranoid or alarmist. The tool should make you feel smart for caring about privacy, not scared. Clean, dense with data, but not cluttered.

References:
- **Observatory by Mozilla** (observatory.mozilla.org) — the security scanner UI feel, clinical authority
- **Have I Been Pwned** (haveibeenpwned.com) — simple input, dramatic results, trust-building design
- **Linear.app** — the dark-mode polish, typography quality, subtle animations

### Theme
Dark mode only (Phase 1). Reinforces the "security tool" positioning and differentiates from the bright/cheerful aesthetic of the tools being audited.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0A0E17` | Page background (deep navy-black) |
| `--bg-surface` | `#111827` | Card surfaces, panels |
| `--bg-elevated` | `#1A2332` | Hover states, active tabs |
| `--border` | `#1E293B` | Subtle borders, dividers |
| `--text-primary` | `#F1F5F9` | Primary text (near-white) |
| `--text-secondary` | `#94A3B8` | Secondary/muted text |
| `--text-tertiary` | `#64748B` | Tertiary/disabled text |
| `--accent-green` | `#22C55E` | Grade A/B, safe indicators, "local processing" badges |
| `--accent-amber` | `#F59E0B` | Grade C, warning states |
| `--accent-red` | `#EF4444` | Grade D/F, danger indicators, tracker counts |
| `--accent-blue` | `#3B82F6` | Links, interactive elements, CTAs |
| `--grade-a` | `#22C55E` | Green |
| `--grade-b` | `#84CC16` | Lime |
| `--grade-c` | `#F59E0B` | Amber |
| `--grade-d` | `#F97316` | Orange |
| `--grade-f` | `#EF4444` | Red |

### Typography
- **Display/Headers:** `JetBrains Mono` or `Space Grotesk` — monospace feel for the audit/scanner context, technical authority
- Actually, per the frontend-design skill, avoid Space Grotesk. Use **`Instrument Sans`** (display, variable weight) for headers — geometric, modern, distinctive.
- **Body:** `IBM Plex Sans` — clean, technical, excellent readability in dense data layouts
- **Monospace (data values):** `JetBrains Mono` — cookie counts, domain lists, scores. The "terminal readout" energy.
- **Grade letters:** `Instrument Sans` at 800 weight, massive size (120px+), with colored glow effect matching the grade color

### Density
Information-dense where showing audit results (users want to see the data). Spacious for the converter UI (users want simplicity). Two distinct density modes within the same app.

### Illustration/Icon Needs
- **No illustrations.** This tool should feel clinical and data-driven, not illustrated.
- **Icons:** Lucide icon set (already available in the stack). Used for: file type indicators, tracker type badges, navigation.
- **Grade badge:** Custom-designed letter in a circle/shield shape. This is the one visual element that needs to be distinctive — it's the thing people screenshot and share.
- **Favicon:** Shield icon with checkmark, green on dark. Simple, recognizable at 16px.

### Key Visual Elements

**The Scan Animation:**
When a user initiates an audit, show a "scanning" animation — a horizontal progress bar with pulsing segments, domain names scrolling by as they're detected (like a terminal log). This builds anticipation and communicates that real work is happening. 3–15 seconds.

**The Grade Reveal:**
After scan completes, the letter grade animates in: starts blurred/scaled up, snaps into focus with a subtle screen-shake effect. Color floods in based on the grade. The drama of the reveal is what makes people screenshot it.

**Report Card Layout:**
Dark card with the tool's favicon, name, and URL at top. Giant letter grade centered. Below: a grid of 4–6 metric tiles (cookies, domains, trackers, session recording, server processing, ad networks) each with a count and a red/green indicator. Bottom: "Scanned by ShipTools" with timestamp.

---

## 4. Data & API Layer

### Data Source 1: Headless Puppeteer Scan (Audit Engine)

**What it does:** Loads a target URL in a headless Chromium browser, waits for the page to fully load, then extracts privacy metrics.

**Where it runs:** Vercel Serverless Function (or Vercel Edge Function if possible — Puppeteer needs Node.js runtime, so standard serverless).

**Implementation:**
```
POST /api/audit/scan
Body: { "url": "https://ilovepdf.com" }
Response: {
  "domain": "ilovepdf.com",
  "cookies": { "total": 637, "firstParty": 12, "thirdParty": 625 },
  "thirdPartyDomains": { "total": 221, "domains": ["doubleclick.net", "facebook.com", ...] },
  "trackers": {
    "analytics": ["Google Analytics", "Hotjar"],
    "advertising": ["Google Ads", "Meta Pixel"],
    "sessionRecording": ["Hotjar"],
    "other": ["Segment"]
  },
  "serverSideProcessing": true | false | "unknown",
  "ssl": true,
  "grade": "D",
  "score": 28,
  "scannedAt": "2026-03-04T..."
}
```

**Technical approach:**
- Use `puppeteer-core` + `@sparticuz/chromium` (optimized for serverless, ~50MB)
- Set realistic user agent and viewport
- Navigate to URL, wait for `networkidle0` (no more than 0 network connections for 500ms)
- Extract cookies via `page.cookies()`
- Intercept network requests via `page.on('request')` to log all third-party domains
- Pattern-match known tracker scripts against request URLs (maintain a tracker fingerprint dictionary)
- Timeout: 30 seconds max (Vercel serverless function limit is 60s on Pro, 10s on Hobby — **need Vercel Pro for this feature**)

**Auth:** None (public endpoint, rate-limited by IP)

**Rate limits:**
- 10 scans per IP per hour (enforced via Supabase or Vercel KV)
- Cached results served for repeated scans of the same domain within 24 hours

**Cost:**
- Vercel Pro plan ($20/month) required for serverless function execution time >10s
- Puppeteer functions consume more memory — budget for 1024MB function size
- At moderate usage (500 scans/day), well within Vercel Pro limits
- Supabase free tier handles caching/storage

**Known limitations:**
- Some sites detect headless browsers and serve different content — include a disclaimer
- Cookie counts vary by geography (ad networks serve different trackers per region) — scan from US-based Vercel region, note this in results
- SPA sites may load trackers dynamically after initial load — extend wait time, but accept imperfection

### Data Source 2: Tracker Fingerprint Dictionary

**What it is:** A static JSON file mapping known tracker domains and script patterns to categories.

**Format:**
```json
{
  "domains": {
    "doubleclick.net": { "category": "advertising", "name": "Google Ads" },
    "hotjar.com": { "category": "sessionRecording", "name": "Hotjar" },
    "google-analytics.com": { "category": "analytics", "name": "Google Analytics" },
    "facebook.net": { "category": "advertising", "name": "Meta Pixel" },
    "fullstory.com": { "category": "sessionRecording", "name": "FullStory" },
    "segment.io": { "category": "analytics", "name": "Segment" },
    "amplitude.com": { "category": "analytics", "name": "Amplitude" },
    "mixpanel.com": { "category": "analytics", "name": "Mixpanel" }
  },
  "scripts": {
    "gtag": { "category": "analytics", "name": "Google Analytics 4" },
    "fbevents": { "category": "advertising", "name": "Meta Pixel" },
    "hotjar": { "category": "sessionRecording", "name": "Hotjar" }
  }
}
```

**Maintenance:** This file is manually updated. Start with 50+ known trackers. Expand based on scan results that surface unknown domains.

**Source:** Open-source tracker lists exist:
- **EasyList / EasyPrivacy** (filterlists.com) — well-maintained ad/tracker domain lists
- **Disconnect.me tracking protection list** (open source on GitHub)
- **DuckDuckGo Tracker Radar** (GitHub: `AUR/AUR`) — most comprehensive

**Cost:** Free (open source lists)

### Data Source 3: Client-Side Libraries (Toolkit Engine)

All client-side, no API cost.

**WASM Libraries (heavy, lazy-loaded per tool route):**

| Library | Tools Powered | Size | Load Strategy |
|---------|--------------|------|---------------|
| `wasm-vips` | Image conversion (F3) | ~8MB | Lazy load on `/convert/images` |
| `ffmpeg.wasm` | Audio conversion (F5), Video (Phase 2) | ~25MB | Lazy load on `/convert/audio` |

**JS Libraries (lightweight, lazy-loaded per tool route):**

| Library | Tools Powered | Size | Load Strategy |
|---------|--------------|------|---------------|
| `pdf-lib` | Doc conversion (F4), PDF merge/split (F14), PDF encrypt | ~300KB | Lazy load on `/convert/documents` or `/pdf` |
| `mammoth` | DOCX → HTML (F4) | ~200KB | Lazy load on `/convert/documents` |
| `papaparse` | CSV ↔ JSON (F4) | ~50KB | Lazy load on `/convert/documents` |
| `exif-js` | EXIF metadata stripping (F6) | ~50KB | Lazy load on `/privacy/exif-stripper` |
| `JSZip` | ZIP/Unzip (F15), batch EXIF download | ~100KB | Lazy load on `/archive` |
| `qrcode` | QR code generator (F9) | ~50KB | Lazy load on `/qr` |
| `js-yaml` | JSON → YAML conversion (F10) | ~30KB | Lazy load on `/dev/json` |
| `spark-md5` | MD5 hashing (F8) | ~10KB | Lazy load on `/dev/hash` |
| `zxcvbn` | Password strength meter (F11) | ~400KB | Lazy load on `/dev/password` |

**Native Browser APIs (zero bundle cost):**

| API | Tools Powered |
|-----|--------------|
| `Web Crypto API` | File encryption AES-256-GCM (F7), SHA hashing (F8), password generation (F11), UUID v4 (F13) |
| `Canvas API` | EXIF-clean image export (F6), image watermarking |
| `JSON.parse/stringify` | JSON formatter (F10) |
| `btoa/atob + FileReader` | Base64 encode/decode (F12) |
| `crypto.getRandomValues` | Password generator (F11), UUID generator (F13) |

**Total incremental bundle for new Phase 1 tools: ~640KB** (all lazy-loaded, never in initial bundle). The 10 new tools add less bundle weight than a single WASM module.

**No auth, no rate limits, no cost.** Everything runs in the browser.

**Note on ffmpeg.wasm:**
- Requires `SharedArrayBuffer` — needs COOP/COEP headers on Vercel:
  ```
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  ```
- These headers break some third-party embeds — apply ONLY to the converter route, not the whole site
- Configure in `vercel.json` with route-specific headers

### Grading Algorithm

Weighted scoring (0–100), mapped to letter grades:

| Factor | Weight | Scoring |
|--------|--------|---------|
| Third-party cookies | 25% | 0 = 100pts, 1–10 = 70pts, 11–50 = 40pts, 51–200 = 20pts, 200+ = 0pts |
| Third-party domains | 20% | 0 = 100pts, 1–5 = 75pts, 6–20 = 50pts, 21–50 = 25pts, 50+ = 0pts |
| Session recording | 20% | None = 100pts, Present = 0pts |
| Ad networks | 15% | 0 = 100pts, 1 = 50pts, 2+ = 0pts |
| Analytics trackers | 10% | 0–1 = 100pts, 2–3 = 60pts, 4+ = 20pts |
| Server-side file processing | 10% | Local = 100pts, Server = 30pts, Unknown = 50pts |

**Grade mapping:**
| Score | Grade |
|-------|-------|
| 90–100 | A |
| 75–89 | B |
| 55–74 | C |
| 35–54 | D |
| 0–34 | F |

### Data Model (Supabase)

**Table prefix: `st_`**

```sql
-- Audit results (cached scans)
CREATE TABLE st_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  st_domain TEXT NOT NULL,                         -- e.g., "ilovepdf.com"
  st_url TEXT NOT NULL,                            -- full scanned URL
  st_grade CHAR(1) NOT NULL,                       -- A, B, C, D, F
  st_score INTEGER NOT NULL,                       -- 0-100
  st_cookies_total INTEGER DEFAULT 0,
  st_cookies_first_party INTEGER DEFAULT 0,
  st_cookies_third_party INTEGER DEFAULT 0,
  st_third_party_domains INTEGER DEFAULT 0,
  st_third_party_domain_list JSONB DEFAULT '[]',   -- array of domain strings
  st_trackers JSONB DEFAULT '{}',                  -- { analytics: [], advertising: [], sessionRecording: [], other: [] }
  st_session_recording_detected BOOLEAN DEFAULT FALSE,
  st_ad_networks_detected INTEGER DEFAULT 0,
  st_server_side_processing TEXT DEFAULT 'unknown', -- 'local' | 'server' | 'unknown'
  st_ssl BOOLEAN DEFAULT TRUE,
  st_scan_duration_ms INTEGER,
  st_scan_error TEXT,                              -- null if successful, error message if partial/failed
  st_favicon_url TEXT,                             -- cached favicon URL
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for fast lookups by domain
  CONSTRAINT st_audits_domain_idx UNIQUE (st_domain, created_at)
);

-- Index for serving cached results
CREATE INDEX st_audits_domain_recent ON st_audits (st_domain, created_at DESC);

-- Audit request queue (users requesting new tool audits)
CREATE TABLE st_audit_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  st_requested_domain TEXT NOT NULL,
  st_requested_by_ip TEXT,                         -- hashed IP for rate limiting
  st_upvotes INTEGER DEFAULT 1,
  st_status TEXT DEFAULT 'pending',                -- 'pending' | 'scanning' | 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics: raw events
CREATE TABLE st_analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  st_session_id TEXT NOT NULL,
  st_event_type TEXT NOT NULL,                     -- 'page_view' | 'action' | 'funnel' | 'error'
  st_event_name TEXT NOT NULL,                     -- 'scan_initiated', 'scan_completed', 'file_converted', etc.
  st_page_path TEXT,
  st_referrer TEXT,
  st_properties JSONB DEFAULT '{}',
  st_device_type TEXT,
  st_country TEXT,
  st_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics: daily aggregates
CREATE TABLE st_analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  st_date DATE NOT NULL,
  st_metric TEXT NOT NULL,
  st_value NUMERIC(12,2) NOT NULL,
  st_dimensions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(st_date, st_metric, st_dimensions)
);
```

**RLS Policies:**
- `st_audits`: Public read (anyone can view audit results). Insert restricted to service role (serverless function).
- `st_audit_requests`: Public insert (anyone can request). Public read (see the queue). Update restricted to service role.
- `st_analytics_events`: Insert via anon key (fire-and-forget from client). No public read.
- `st_analytics_daily`: Read restricted to service role (admin dashboard only).

---

## 5. Tech & Deployment

### Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14+ (App Router) + TypeScript | |
| Styling | Tailwind CSS | Dark mode only in Phase 1 |
| Database | Supabase (PostgreSQL + JSONB + RLS) | Audit caching + analytics |
| Auth | Supabase Auth | Phase 1: anonymous only. Phase 2: auth for API keys, saved audits |
| Analytics | Supabase (custom `st_analytics_*` tables) | |
| Deploy | Vercel (Pro plan required) | Serverless functions >10s for Puppeteer |
| Headless Browser | puppeteer-core + @sparticuz/chromium | Vercel serverless function |
| Image Conversion | wasm-vips | Client-side WASM |
| Audio Conversion | ffmpeg.wasm | Client-side WASM |
| Document Conversion | pdf-lib + mammoth + papaparse | Client-side JS |
| Privacy Tools | exif-js + Web Crypto API | Client-side JS + native |
| Developer Utils | spark-md5, qrcode, js-yaml, zxcvbn, JSZip | Client-side JS, all lazy-loaded |
| Report Card Image | @vercel/og (Satori) or html-to-image | Server-rendered OG image |
| Domain | shiptools.dev | Check availability |

### Route Structure

```
src/app/
├── page.tsx                           ← Landing: scan input + tool category grid
├── audit/
│   └── [domain]/
│       └── page.tsx                   ← Audit result page (SSR from Supabase cache)
├── convert/
│   ├── page.tsx                       ← Converter hub with tabs
│   ├── images/page.tsx                ← Image converter (F3)
│   ├── documents/page.tsx             ← Document converter (F4)
│   └── audio/page.tsx                 ← Audio converter (F5)
├── privacy/
│   ├── page.tsx                       ← Privacy tools hub
│   ├── exif-stripper/page.tsx         ← EXIF metadata stripper (F6)
│   └── encrypt/page.tsx               ← File encryption/decryption (F7)
├── dev/
│   ├── page.tsx                       ← Developer tools hub
│   ├── hash/page.tsx                  ← Hash calculator (F8)
│   ├── json/page.tsx                  ← JSON formatter/validator (F10)
│   ├── password/page.tsx              ← Password generator (F11)
│   ├── base64/page.tsx                ← Base64 encode/decode (F12)
│   └── uuid/page.tsx                  ← UUID generator (F13)
├── pdf/
│   └── page.tsx                       ← PDF merge/split (F14)
├── qr/
│   └── page.tsx                       ← QR code generator (F9)
├── archive/
│   └── page.tsx                       ← ZIP/Unzip (F15)
├── api/
│   ├── audit/
│   │   └── scan/route.ts             ← POST: Puppeteer scan endpoint
│   ├── og/
│   │   └── [domain]/route.tsx        ← Dynamic OG image generation
│   └── analytics/
│       └── aggregate/route.ts         ← Daily aggregation cron
├── layout.tsx                         ← Root layout (dark theme, fonts, analytics script)
└── globals.css                        ← Tailwind + CSS custom properties
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL          ❌  (new Supabase project needed)
NEXT_PUBLIC_SUPABASE_ANON_KEY     ❌  
SUPABASE_SERVICE_ROLE_KEY         ❌  (server-side only — scan results insertion)
NEXT_PUBLIC_SITE_URL              ✅  (shiptools.dev or Vercel preview URL)
```

No third-party API keys needed for Phase 1. All conversion is client-side. Puppeteer/Chromium are npm packages, not external services.

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/app/api/audit/scan/route.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/convert/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

**Important:** COOP/COEP headers only on `/convert/*` routes. Applying them globally breaks OG image unfurling and third-party script loading.

---

## 6. Success Criteria

### Phase 1 "Done" Definition

**Audit (F1–F2):**
- [ ] User can paste a URL and receive a privacy grade with full breakdown in <15 seconds
- [ ] Audit results are cached in Supabase and served instantly on repeat visits
- [ ] Shareable audit page exists at `/audit/{domain}` with proper OG tags showing the grade
- [ ] Report card PNG downloadable from audit page

**Converters (F3–F5):**
- [ ] Image converter handles WEBP ↔ PNG ↔ JPEG ↔ AVIF with batch support, 100% client-side
- [ ] Document converter handles DOCX → PDF, CSV ↔ JSON, Markdown ↔ HTML, 100% client-side
- [ ] Audio converter handles MP3 ↔ WAV ↔ OGG ↔ FLAC with bitrate selection, 100% client-side

**Privacy Tools (F6–F7):**
- [ ] EXIF stripper shows hidden metadata (GPS, camera, timestamps) then strips it — batch support
- [ ] File encryption/decryption works with AES-256-GCM via Web Crypto API, handles files up to 100MB

**Developer Utilities (F8–F13):**
- [ ] Hash calculator supports MD5/SHA-1/SHA-256/SHA-512 for files and text, streams large files
- [ ] QR code generator creates codes from text/URL/WiFi/vCard with PNG and SVG export
- [ ] JSON formatter validates, pretty-prints, minifies, and converts to CSV/YAML
- [ ] Password generator produces cryptographically secure passwords and passphrases with strength meter
- [ ] Base64 encode/decode works for text and files up to 25MB
- [ ] UUID v4 generator produces 1–100 UUIDs with format options

**File Tools (F14–F15):**
- [ ] PDF merge/split handles drag-and-drop reordering and page range selection
- [ ] ZIP/Unzip creates and extracts archives up to 200MB with file tree preview

**Cross-cutting:**
- [ ] "All processing happens locally" messaging is prominent on every tool page
- [ ] Analytics tracking: scan_initiated, scan_completed, tool_used (by tool name), file_processed (by type), share_clicked
- [ ] Mobile responsive — audit + lightweight tools work on mobile, WASM tools work on desktop
- [ ] Lighthouse performance score >90 on landing page (all WASM and heavy libraries lazy-loaded)
- [ ] Navigation: landing page shows tool category grid with search/filter
- [ ] Every tool page has a "zero uploads" badge and a link back to the privacy audit

### Hard Constraints

- **Zero file uploads.** No file ever leaves the browser for conversion. This is the core promise.
- **Vercel Pro plan** required for Puppeteer function duration. Budget $20/month.
- **ffmpeg.wasm requires SharedArrayBuffer** — COOP/COEP headers must be scoped to converter routes only
- **No auth in Phase 1.** Anonymous usage only. Supabase Auth added in Phase 2 for API keys and saved audit history.

---

## 7. Claude Code Skills to Use

### Always Include
- `/frontend-design` — Dark-mode, data-dense UI with the grade reveal animation and report card design
- `/vibesec` — Critical for a privacy/security tool. Audit the scan endpoint for injection, rate limiting, and ensure no user files ever touch the server
- `/code-reviewer` — After each phase

### Include When Relevant
- `/web-dev` — Next.js App Router, TypeScript, serverless functions
- `/backend-architect` — Puppeteer scan architecture, Supabase schema, caching strategy, rate limiting
- `/frontend-developer` — WASM integration, lazy loading, progress indicators for large file conversions
- `/superdesign` — Report card visual design (the most important visual asset — needs to be screenshot-worthy)

### At Launch
- `/project-shipper` — Launch sequencing per GTM plan below
- `/brand-guardian` — Consistent dark-mode aesthetic across audit pages, converter, OG images

---

## 8. GTM Plan

### Positioning Statement

```
FOR developers and technical builders
WHO use free online tools (converters, PDF editors, JSON formatters, QR generators) daily without realizing they're being tracked by hundreds of ad networks and data brokers
SHIPTOOLS IS A privacy-first browser toolkit and privacy auditor
THAT gives you 15+ essential tools that run 100% in your browser — plus shows you exactly what the "free" alternatives are doing with your data
UNLIKE browser-based tools that process files on remote servers surrounded by tracking infrastructure
OUR PRODUCT replaces a dozen bookmarked free tools with one private toolkit — file conversion, encryption, developer utilities, metadata stripping — and audits any tool's privacy practices in seconds
```

### One-Liner
"ShipTools is 15+ essential tools that run 100% in your browser — plus a privacy audit that shows what the 'free' alternatives are really doing."

### Narrative Hook
"A Reddit post revealed that iLovePDF sets 637 cookies from 221 domains when you upload a single document. So I built a toolkit where nothing ever leaves your browser — file conversion, encryption, EXIF stripping, developer utilities, and a scanner that audits any tool's privacy practices."

### Launch Channels (in order)

1. **LinkedIn** (Day 1) — "I scanned 20 popular free tools for trackers. Here's what I found." Data-heavy post with the most shocking audit results. Screenshot of worst report cards. Link to ShipTools.
2. **X/Twitter** (Day 1) — Thread: Tweet 1 = hook stat + link. Tweets 2-4 = individual tool audit screenshots. Tweet 5 = CTA.
3. **Reddit** (Days 2-5, staggered):
   - **r/webdev** — "I built a privacy scanner for free online tools + a browser-only file converter"
   - **r/privacy** — Lead with the audit findings, link to tool
   - **r/SideProject** — Build log angle: "Built this in a weekend with Claude Code"
   - **r/YouShouldKnow** — Meta play: reference the original post that inspired it. "YSK: I built an open-source tool that audits the privacy of free converters (inspired by the iLovePDF cookie post)"
   - **r/InternetIsBeautiful** — Only if the design is genuinely polished
4. **Hacker News** (Day 3-5) — "Show HN: ShipTools — Privacy audits for free tools + local file conversion." HN loves privacy tools and security scanners.
5. **Product Hunt** (Week 2-3) — Weekend launch for side project positioning.

### Pre-Launch Seed List
- The original Reddit post author (DM to thank them for the inspiration, share ShipTools)
- Privacy-focused dev influencers on X/LinkedIn
- Indie hacker community members who've shared privacy concerns
- People who commented on the Reddit post expressing frustration

### Launch Assets Needed
- [ ] 5-6 audit report card screenshots (worst offenders: iLovePDF, SmallPDF, etc.)
- [ ] Hero image: side-by-side comparison showing "What iLovePDF sees" (637 cookies) vs "What ShipTools sees" (0 cookies)
- [ ] Demo GIF: paste URL → scan animation → grade reveal → download report card
- [ ] OG tags with dynamic audit images per tool page
- [ ] README.md if open-sourcing the audit engine

### Content Drip Plan

| Week | Post | Platform |
|------|------|----------|
| 1 | Launch: "I scanned 20 free tools. Here's what's tracking you." | LinkedIn, X, Reddit |
| 1 | Results: "500 developers scanned their favorite tools in 24 hours" | LinkedIn, X |
| 2 | Spotlight: Deep-dive on one category (PDF tools privacy comparison) | LinkedIn |
| 2 | Product Hunt launch | LinkedIn, X, PH |
| 3 | "The Safest Free Tools of 2026" — first rankings from aggregated data | LinkedIn, Reddit |
| 3 | Technical: "How I built a privacy scanner with Puppeteer + Vercel" | LinkedIn, HN, Dev.to |
| 4 | Retro: "I launched ShipTools. Here's what I learned." | LinkedIn |

### Paid Media
Only after organic gate criteria met (200+ visitors, 3%+ LinkedIn engagement, 30%+ on-site interaction, 60s+ session). If gates pass:
- Phase 1 micro-test: $50-100 on LinkedIn targeting "Software Developer" + "Privacy" interests
- Creative: The report card comparison image (most shocking grades)

### Viral Loop
```
User discovers ShipTools → Audits a tool they use daily
    → Sees shocking report card (637 cookies?!)
    → Downloads report card image / copies share link
    → Posts to X/LinkedIn ("look what iLovePDF does")
    → Their followers scan THEIR tools → new report cards shared
    → Cycle repeats
```

**The report card is the atomic unit of virality.** It must be screenshot-worthy, bold, and legible at Twitter thumbnail size.

### Open Source Strategy
Consider open-sourcing the tracker fingerprint dictionary and the grading algorithm (not the full app). This:
- Builds credibility with the privacy community
- Gets contributions to expand the tracker database
- Differentiates from closed-source security scanners
- Drives GitHub stars → builder audience credibility

---

## Appendix: Domain Availability Check

Run before build:
```bash
dig shiptools.dev +short
dig shiptools.app +short
dig shiptools.io +short
dig shiptools.com +short
```

**Fallbacks:** `getshiptools.com`, `shiptools.app`, `myshiptools.dev`
