# ShipLocal: Complete Expansion Plan — Phased & Ranked

## Context

ShipLocal (formerly ShipTools) has the audit scanner (F1-F2) and three converters (F3-F5) built. The PRD v1.1 defines 15 Phase 1 features (10 unbuilt), plus Phase 2-3 features. The Extended Ideas doc adds ~100 more tool ideas across 4 tiers. This plan ranks and groups everything — PRD features, Extended Ideas, and new research findings (video, PDF signing) — into three implementation phases.

**Guiding principle:** Phase 1 should make someone say *"wait, this all runs in a BROWSER?"* and come back daily.

---

## Phase 1 — "Ship the Wow" (This Build Cycle)

### Group A: Converter Completeness
*Fix gaps, expand format coverage, make the existing converters best-in-class.*

| # | Feature | New Deps | Effort | Why Phase 1 |
|---|---------|----------|--------|-------------|
| A1 | **PDF → JSON** | None (pdfjs-dist) | Small | User-reported gap. Structured page text + metadata extraction. |
| A2 | **Image resize UI** | None | Small | Backend exists, UI just needs width/height inputs + presets + aspect lock. |
| A3 | **XLSX → CSV/JSON** | `xlsx` (~300KB) | Small | Fixes existing bug (.xlsx in accept list but errors). SheetJS handles it. |
| A4 | **SVG → PNG/JPG** | None (Canvas API) | Small | ~15 lines. Parse viewBox, render via Image() + Canvas. |
| A5 | **Video conversion** | None (ffmpeg.wasm already loaded) | Medium | Same 32MB WASM binary has H.264, VP9, GIF codecs. MP4/WebM/MOV/AVI/MKV/GIF → MP4/WebM/GIF. New `VideoConverter.tsx` + `/convert/video` tab. Resolution picker, quality slider, trim. Mobile warning (iOS SharedArrayBuffer issues). **This is the biggest "wow" — video conversion in the browser with zero server.** |

### Group B: Done-State UX Polish
*Make batch conversion feel confident and complete.*

| # | Feature | New Deps | Effort | Why Phase 1 |
|---|---------|----------|--------|-------------|
| B1 | **Batch progress bar** | None | Small | "Converting 3 of 5..." with animated progress bar. |
| B2 | **Batch completion banner** | None | Small | "All 5 files converted" + Download All button. |
| B3 | **Done animations** | None | Small | CSS pop-in for CircleCheck, fade-in for banner. |
| B4 | **Hook batch state** | None | Small | `useConverter` returns `doneCount`, `isBatchComplete`, `downloadAll()`. Fix dead `doneCount` in ImageConverter. |

### Group C: PDF Signing — The Differentiator
*Zero-deps DocuSign alternative. The entire workflow runs client-side.*

| # | Feature | New Deps | Effort | Why Phase 1 |
|---|---------|----------|--------|-------------|
| C1 | **PDF sign & form fill** | None (pdf-lib + pdfjs-dist) | Large | Upload PDF → preview → draw/type/upload signature → place on page → fill form fields (text, checkbox, radio, dropdown) → date stamp → download. **Every open-source alternative (OpenSign, DocuSeal, Documenso) needs a server. This would be the only truly client-side PDF signer.** Visual signatures only (not cryptographic PKCS#7). New `/sign` route. |

### Group D: PRD Phase 1 Unbuilt Features (Quick Pure-JS Tools)
*These are the "every developer needs this" retention tools.*

| # | Feature | PRD | New Deps | Effort | Why Phase 1 |
|---|---------|-----|----------|--------|-------------|
| D1 | **EXIF / Metadata Stripper** | F6 | exif-js (~50KB) | Medium | Privacy brand story. "See what's hidden in your photo" reveal → strip → download clean. Batch + ZIP download via JSZip. |
| D2 | **File Encryption** | F7 | None (Web Crypto) | Medium | AES-256-GCM, PBKDF2 key derivation. Zero deps. Privacy power tool. |
| D3 | **Hash Calculator** | F8 | spark-md5 (~10KB) | Small | MD5/SHA-1/SHA-256/SHA-512. File streaming. Verify mode. |
| D4 | **QR Code Generator** | F9 | qrcode (~50KB) | Small | Text/URL/WiFi/vCard. PNG + SVG export. Live preview. |
| D5 | **JSON Formatter** | F10 | js-yaml (~30KB) | Medium | Validate, pretty-print, minify, tree view. JSON → CSV/YAML. Web Worker for large files. |
| D6 | **Password Generator** | F11 | zxcvbn (~400KB lazy) | Small | Web Crypto API. Passphrases via EFF wordlist. Strength meter. |
| D7 | **Base64 Encode/Decode** | F12 | None | Small | Text + file mode. Auto-detect. Native btoa/atob. |
| D8 | **UUID Generator** | F13 | None | Small | V4 random via Web Crypto. Bulk 1-100. Format options. |
| D9 | **PDF Merge / Split** | F14 | None (pdf-lib) | Medium | Drag-to-reorder merge. Page range split with thumbnail preview. |
| D10 | **ZIP / Unzip** | F15 | JSZip (~100KB) | Medium | Create/extract. File tree preview. Up to 200MB. |

### Group E: Extended Ideas — Phase 1 Picks
*High-impact, low-effort tools from the Extended Ideas doc that punch above their weight.*

| # | Feature | Tier | New Deps | Effort | Why Phase 1 |
|---|---------|------|----------|--------|-------------|
| E1 | **Browser Fingerprint Viewer** | 3 | None | Small | Pure JS, 0KB. "See how trackable you are." Canvas fingerprint, WebGL, fonts, timezone. **Extremely shareable** — perfect brand fit. Viral potential equal to the audit scanner. |
| E2 | **Tracking Pixel Detector** | 3 | None | Small | Paste email HTML → detect all tracking pixels + beacons. Pure JS HTML parser. Privacy brand reinforcement. |
| E3 | **Invisible Character Detector** | 2 | None | Small | Detect zero-width characters in pasted text. Pure JS. Tiny tool, big "aha" moment. |
| E4 | **Clipboard Cleaner** | 3 | None | Small | Paste rich text → strip hidden formatting, tracking pixels, embedded styles. DOMParser. Solves real annoyance. |
| E5 | **Epoch / Timestamp Converter** | 2 | None | Small | Unix ↔ human dates ↔ ISO 8601. Timezone support. Pure JS Date API. Every dev uses this daily. |
| E6 | **JWT Decoder** | 2 | None | Small | Decode header + payload. Show expiry. Pure JS base64. "Inspect JWTs without sending them to jwt.io." Privacy angle. |

### Group F: Transparent Telemetry
*Privacy-respecting analytics that become a trust signal, not a liability.*

| # | Feature | Effort | Details |
|---|---------|--------|---------|
| F1 | **Client-Side Event Tracker** | Small | `track()` via `sendBeacon`, opt-out check, ephemeral session ID, <1ms overhead |
| F2 | **Server-Side Event Receiver** | Small | `POST /api/analytics/event`, country from Vercel header, IP never stored, rate limited 50/session/hr |
| F3 | **Consent Banner + Opt-Out** | Small | Inline banner (not modal), localStorage toggle, footer indicator, no dark patterns |
| F4 | **Event Schema (7 events)** | Small | page_view, tool_opened, tool_used, scan_initiated, scan_completed, report_shared, telemetry_opted_out |

Reference: Full spec in `ShipTools-Analytics-PRD-v2.md`

### Phase 1 Summary

**Total: ~31 features** across 6 groups.

Key "wow" moments:
1. **Video conversion in-browser** (Group A5) — "Wait, it converts video without uploading?"
2. **PDF signing with zero server** (Group C1) — "This replaces DocuSign and nothing leaves my browser?"
3. **Browser Fingerprint Viewer** (Group E1) — "I had no idea I was this trackable"
4. **Transparent telemetry** (Group F) — "They tell you exactly what they collect and let you turn it off"
5. **15 developer tools** (Group D) — "I can stop bookmarking 15 different sites"

New deps: `xlsx` (~300KB), `exif-js` (~50KB), `spark-md5` (~10KB), `qrcode` (~50KB), `js-yaml` (~30KB), `zxcvbn` (~400KB lazy), `JSZip` (~100KB). Total: ~940KB, all lazy-loaded.

---

## Phase 2 — "Expand the Platform" (Next Sprint)

### Group F: AI/ML "Wait, That Runs in a Browser?" Features
*Transformers.js / ONNX Runtime Web. Heavy model downloads but lazy-loaded.*

| # | Feature | Model Size | Why Phase 2 |
|---|---------|------------|-------------|
| F1 | **Background Removal** (RMBG-1.4) | ~40MB | Proven demand (remove.bg is a unicorn). Privacy pitch: "remove.bg but it never sees your photos." |
| F2 | **Speech-to-Text** (Whisper tiny/base) | 75-500MB | "Transcribe a meeting without uploading it." Killer feature for podcasters, journalists. |
| F3 | **Image Upscaling** (ESRGAN) | ~20MB | "Enhance blurry screenshots without uploading." Visual before/after is shareable. |
| F4 | **Face Detection + Blur** (MediaPipe) | ~5MB | "Anonymize photos before posting." Privacy brand perfect. Small model. |
| F5 | **Depth Map Generator** (Depth Anything V2) | ~50MB | Pure "wow" factor. Shareable output. Fun + technically impressive. |

### Group G: Developer & Design Power Tools
*High-utility retention tools that bring people back daily.*

| # | Feature | Tier | New Deps |
|---|---------|------|----------|
| G1 | **Code Screenshot Generator** (Carbon-like) | 2 | Prism.js + Canvas (~200KB) |
| G2 | **Favicon Generator** (all platform sizes) | 2 | Canvas + JSZip (already installed) |
| G3 | **Text Diff / Compare** | 2 | diff + diff2html (~130KB) |
| G4 | **JSON ↔ YAML ↔ TOML** | 2 | @iarna/toml (~30KB) |
| G5 | **Cron Expression Builder** | 2 | cronstrue (~20KB) |
| G6 | **Color Palette from Image** | 2 | Color Thief (~10KB) |
| G7 | **Contrast Checker (WCAG)** | 2 | None |
| G8 | **CSS Gradient Generator** | 2 | None |
| G9 | **SVG → React Component** | 2 | None |
| G10 | **Regex Playground** | 1 | None |
| G11 | **Word/Character Counter** | 2 | None |
| G12 | **Case Converter** | 2 | None |
| G13 | **Markdown Editor** (dual-pane) | 2 | markdown-it (~100KB) |

### Group H: Privacy Brand Tools
*Unique to ShipTools — "nobody else has this" privacy features.*

| # | Feature | Tier | New Deps |
|---|---------|------|----------|
| H1 | **Document Redactor** | 3 | pdf-lib + regex (already installed) |
| H2 | **Email Header Analyzer** | 3 | None |
| H3 | **File Signature Checker** (magic bytes) | 3 | None |
| H4 | **"What's In This File?"** (universal metadata) | 3 | Multi-format parsers |
| H5 | **Privacy Policy Analyzer** | 3 | Server fetch + client analysis |

### Group I: PRD Phase 2 Features
*Platform & distribution features.*

| # | Feature | PRD |
|---|---------|-----|
| I1 | **Safe Stack Directory** (30+ tools pre-audited) | F16 |
| I2 | **Comparison Mode** (side-by-side tool audits) | F17 |
| I3 | **Scheduled Re-Scans** (weekly cron, grade history) | F19 |

### Group J: Additional Developer Utilities

| # | Feature | New Deps |
|---|---------|----------|
| J1 | **SQL Formatter** | sql-formatter (~50KB) |
| J2 | **IP Address Tools** (subnet calc, CIDR) | None |
| J3 | **Chmod Calculator** | None |
| J4 | **URL Parser** | None |
| J5 | **HTML Entity Encoder/Decoder** | None |
| J6 | **Number Base Converter** | None |
| J7 | **Unit Converter** | None |
| J8 | **User-Agent Parser** | ua-parser-js (~20KB) |
| J9 | **.env Validator** | None |
| J10 | **robots.txt / .htaccess Generator** | None |
| J11 | **CSP Header Builder** | None |

### Group K: Analytics Infrastructure
*Roll up raw events and surface insights for admins.*

| # | Feature | Details |
|---|---------|---------|
| K1 | **Daily Aggregation Cron** | `/api/analytics/aggregate`, 03:00 UTC, rolls raw events into `st_analytics_daily` |
| K2 | **Admin Analytics Dashboard** | `/admin/analytics`, charts for tool popularity, geography, traffic sources, device split |

---

## Phase 3 — "Full Platform" (Future)

### Group L: AI/ML Extended
| Feature | Model Size |
|---------|------------|
| Object Detection (YOLO/DETR) | ~25MB |
| Language Translation (MarianMT) | ~100MB/pair |
| Text Summarization (DistilBART) | ~500MB |
| Sentiment Analysis (DistilBERT) | ~70MB |
| Named Entity Recognition (BERT NER) | ~50MB |
| Image Captioning (ViT-GPT2) | ~350MB |
| Pose Estimation (MediaPipe) | ~5MB |

### Group M: Full Applications
| Feature | Library |
|---------|---------|
| SQLite Explorer | sql.js (~1MB) |
| Python Playground | Pyodide (~15MB) |
| Spreadsheet Editor | x-spreadsheet |
| Whiteboard / Drawing | Excalidraw / tldraw |
| E-Book Reader (.epub) | epub.js |
| Photo Editor (crop/filter) | Canvas API |
| Audio Recorder | MediaRecorder API |
| Screen Recorder | getDisplayMedia API |
| Camera Scanner | getUserMedia + edge detection |
| Mermaid Diagram Renderer | mermaid.js |
| Pixel Art Editor | Canvas API |

### Group N: Growth & Distribution (PRD Phase 3)
| Feature | PRD |
|---------|-----|
| Browser Extension (grade badge on sites) | F20 |
| "What Did They See?" Mode | F21 |
| Community Leaderboard | F22 |
| Public API Access | F23 |

### Group O: Public Transparency
*Turn telemetry into a trust-building feature users can see and verify.*

| Feature | Details |
|---------|---------|
| **Public Transparency Page** | `/transparency` — live telemetry preview, public stats, comparison table, GitHub source links |

### Group P: Fun / Niche Tools
| Feature |
|---------|
| Music Visualizer (Web Audio + Canvas) |
| Audio Waveform Generator |
| ASCII Art Generator |
| Color Blindness Simulator |
| Morse Code Translator |
| White Noise Generator |
| Metronome / Tuning Fork |
| Pomodoro Timer |
| Git Diff Viewer |
| Code Minifier (terser + cssnano) |
| Code Formatter (Prettier standalone) |
| ROT13 / Caesar Cipher |
| Unicode Inspector |
| Smart Quotes Converter |
| Lorem Ipsum Generator |
| Slug Generator |

---

## Logical Groupings for Navigation

Full Phase 1 site structure:

```
/                       ← Landing (audit input + tool grid)
/audit/[domain]         ← Audit results

/convert/               ← Converter hub
  /images               ← Image (resize, format, SVG→raster)
  /documents            ← Document (PDF, DOCX, XLSX, CSV, JSON)
  /audio                ← Audio (MP3, WAV, OGG, AAC, FLAC)
  /video                ← Video (MP4, WebM, GIF)  [NEW]

/sign                   ← PDF Sign & Form Fill  [NEW]

/pdf/                   ← PDF Tools hub
  /merge                ← PDF Merge
  /split                ← PDF Split

/privacy/               ← Privacy Tools hub
  /exif-stripper        ← EXIF metadata strip
  /encrypt              ← File encrypt/decrypt
  /fingerprint          ← Browser fingerprint viewer  [NEW]
  /tracking-pixels      ← Email tracking detector  [NEW]
  /clipboard            ← Clipboard cleaner  [NEW]

/dev/                   ← Developer Tools hub
  /json                 ← JSON formatter/validator
  /hash                 ← Hash calculator
  /password             ← Password generator
  /base64               ← Base64 encode/decode
  /uuid                 ← UUID generator
  /jwt                  ← JWT decoder  [NEW]
  /epoch                ← Timestamp converter  [NEW]
  /invisible-chars      ← Invisible character detector  [NEW]

/qr                     ← QR Code generator
/archive                ← ZIP/Unzip
```

---

## Implementation Priority (This Session)

Recommended build order for highest-impact, most cohesive subset:

1. **A1-A5** — Converter completeness (PDF→JSON, resize UI, XLSX, SVG, video)
2. **B1-B4** — Done-state UX (batch progress, banner, animations)
3. **C1** — PDF signing (the differentiator)

These three groups form a coherent story: *"ShipTools now converts everything — documents, images, audio, AND video — plus signs PDFs, all in your browser."*

The remaining Phase 1 features (Groups D + E) are mostly small pure-JS tools that can be cranked out rapidly in a follow-up session.

---

## Key Technical Notes

### Video Conversion (A5)
- ffmpeg.wasm `@ffmpeg/core@0.12.6` already includes H.264 (libx264), VP9 (libvpx), GIF codecs
- Same 32MB WASM binary used for audio — no additional download
- Extract `getFFmpeg()` singleton from AudioConverter into shared `src/lib/ffmpeg.ts`
- 200MB max file size (WASM memory constraints)
- ~12-25x slower than native FFmpeg (warn users for large files)
- iOS Safari may not work (SharedArrayBuffer issues) — show mobile warning
- COOP/COEP headers already configured for `/convert/*` routes

### PDF Signing (C1)
- pdf-lib has full AcroForm APIs: `getTextField`, `getCheckBox`, `getRadioGroup`, `getDropdown`
- `page.drawImage()` embeds PNG signatures at arbitrary coordinates
- pdfjs-dist renders preview pages to canvas
- Coordinate conversion: `pdfY = pageHeight - (screenY / scale)`
- Visual signatures only (no PKCS#7 cryptographic signing in V1)
- XFA forms not supported — detect with `form.hasXFA()` and show warning
- Every open-source alternative (OpenSign, DocuSeal, Documenso) requires a server

### Image Resize (A2)
- `convertImage()` already handles `options.width`/`height` with aspect-ratio math
- Just needs UI: mode toggle (Original/Preset/Custom), width/height inputs, aspect lock
- Read natural dimensions from first dropped file via `new Image()` for ratio calculations

### Batch UX (B1-B4)
- `useConverter.ts` hook extended with derived state: `doneCount`, `isBatchComplete`, `downloadAll()`
- All three converters get progress bar + completion banner
- CSS animations: `animate-fade-in` (slide-up), `animate-done-check` (pop-in scale)
