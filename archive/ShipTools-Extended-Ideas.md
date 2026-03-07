# ShipTools — Extended Tool Ideas (The "Go Crazy" List)

Everything below runs 100% client-side. Grouped by how unexpected/differentiated they are.

---

## TIER 1: "Wait, that runs in a BROWSER?" (Viral potential)

These are the tools that make people share ShipTools just because they're impressed.

### AI / ML (All via Transformers.js / ONNX Runtime Web — no server)

| Tool | What It Does | Library | Model Size | Why It's Wild |
|------|-------------|---------|------------|---------------|
| **Speech-to-Text (Whisper)** | Transcribe audio/video to text, locally | whisper.wasm / Transformers.js | ~75MB (tiny) to ~500MB (base) | "Transcribe a meeting recording without it ever leaving your laptop" |
| **Background Removal** | Remove background from any image | Transformers.js + RMBG-1.4 | ~40MB | "remove.bg but it never sees your photos" |
| **Image Upscaling** | 2x/4x AI super-resolution | Transformers.js + ESRGAN | ~20MB | "Enhance blurry screenshots without uploading anywhere" |
| **Object Detection** | Draw bounding boxes + labels on objects in images | Transformers.js + YOLO/DETR | ~25MB | Useful AND impressive |
| **Language Translation** | Translate text between languages | Transformers.js + MarianMT models | ~100MB per pair | "Google Translate without Google" |
| **Text Summarization** | Summarize long documents | Transformers.js + DistilBART | ~500MB | Heavy but impressive demo |
| **Sentiment Analysis** | Analyze tone of text (positive/negative/neutral) | Transformers.js + DistilBERT | ~70MB | Useful for content creators checking copy |
| **Named Entity Recognition** | Extract names, places, organizations from text | Transformers.js + BERT NER | ~50MB | Good for document redaction workflow |
| **Depth Map Generator** | Create 3D depth map from any 2D photo | Transformers.js + Depth Anything V2 | ~50MB | Pure "wow" factor, shareable output |
| **Image Captioning** | Generate text description of any image | Transformers.js + ViT-GPT2 | ~350MB | Accessibility use case + impressive |
| **Face Detection + Blur** | Auto-detect faces and blur them | MediaPipe Face Detection | ~5MB | Privacy story: "Anonymize photos before posting" |
| **Pose Estimation** | Detect human body pose from image | MediaPipe Pose | ~5MB | Fun demo, fitness screenshot analysis |

### Full Runtimes in Browser

| Tool | What It Does | Library | Size | Why It's Wild |
|------|-------------|---------|------|---------------|
| **Python Playground** | Run Python code in browser (NumPy, Pandas included) | Pyodide | ~15MB + packages | "Run Python without installing anything" |
| **SQLite Explorer** | Open, query, browse .sqlite/.db files | sql.js (SQLite WASM) | ~1MB | "Explore any SQLite database privately" — great for devs |
| **Regex Playground** | Write, test, debug regex with visual match highlighting | Pure JS | 0KB | Everyone needs this, surprisingly few good ones exist |

---

## TIER 2: "Every Developer Needs This" (High utility, daily use)

### Design & Creative Tools

| Tool | What It Does | Library | Size |
|------|-------------|---------|------|
| **Favicon Generator** | Generate ICO/PNG/SVG favicons from text, emoji, or image upload (all sizes for all platforms) | Canvas API + JSZip | ~100KB |
| **OG Image Preview** | Preview how your Open Graph meta tags will look on Twitter/LinkedIn/Facebook | Pure JS + Canvas | 0KB |
| **Color Palette Generator** | Extract dominant colors from any uploaded image | Color Thief (~10KB) + Canvas API | ~10KB |
| **Color Palette from URL** | Paste a URL, extract the site's color scheme from CSS | Regex parser (pure JS) | 0KB |
| **Contrast Checker (WCAG)** | Check if two colors meet WCAG accessibility standards (AA/AAA) | Pure JS (color math) | 0KB |
| **Font Inspector** | Upload any .ttf/.otf/.woff2 file, preview all glyphs, see metadata, test text rendering | opentype.js | ~200KB |
| **Font Subsetter** | Strip unused glyphs from a font file to reduce size (for web performance) | opentype.js + subset logic | ~200KB |
| **Screenshot Mockup Generator** | Upload a screenshot, place it in a device frame (phone, laptop, browser) | Canvas API + device frame SVGs | ~500KB (frames) |
| **Placeholder Image Generator** | Generate placeholder images at any dimension with text overlay | Canvas API | 0KB |
| **CSS Gradient Generator** | Visual builder for CSS linear/radial/conic gradients with code output | Pure JS | 0KB |
| **Box Shadow Generator** | Visual builder for CSS box-shadow with live preview and code output | Pure JS | 0KB |
| **SVG → React Component** | Convert SVG markup to React JSX component | Pure JS (string transform) | 0KB |

### Text & Writing Tools

| Tool | What It Does | Library | Size |
|------|-------------|---------|------|
| **Markdown Editor** | Live dual-pane markdown editor with preview | markdown-it | ~100KB |
| **Text Diff / Compare** | Side-by-side comparison of two text blocks with highlighted changes | diff (JS) + diff2html | ~130KB |
| **Word/Character Counter** | Count words, characters, sentences, paragraphs, reading time, keyword density | Pure JS | 0KB |
| **Case Converter** | UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, CONSTANT_CASE, Sentence case | Pure JS | 0KB |
| **Text Cleaner** | Strip HTML tags, remove extra whitespace, fix encoding issues, remove non-printable chars | Pure JS | 0KB |
| **Lorem Ipsum Generator** | Generate placeholder text (classic, hipster, bacon, corporate, technical) | Pure JS + word lists | ~20KB |
| **Slug Generator** | Convert any text to URL-friendly slug (handles unicode, multiple languages) | Pure JS | 0KB |
| **ROT13 / Caesar Cipher** | Encode/decode text with rotation ciphers | Pure JS | 0KB |
| **Unicode Inspector** | Paste text, see every character's unicode codepoint, name, category | Pure JS + unicode data | ~500KB |
| **Invisible Character Detector** | Detect and highlight invisible/zero-width characters in pasted text | Pure JS | 0KB |
| **Smart Quotes Converter** | Convert straight quotes to curly quotes (and vice versa) | Pure JS | 0KB |

### Data & Conversion Tools

| Tool | What It Does | Library | Size |
|------|-------------|---------|------|
| **JSON ↔ YAML ↔ TOML** | Convert between configuration file formats | js-yaml + @iarna/toml | ~60KB |
| **JSON ↔ XML** | Convert JSON to XML and back | fast-xml-parser | ~50KB |
| **JSON → TypeScript Types** | Generate TypeScript interfaces from JSON data | quicktype (JS) or custom parser | ~100KB |
| **CSV Viewer / Editor** | Spreadsheet-like view of CSV files with sort, filter, search | PapaParse + custom grid | ~50KB |
| **Epoch / Timestamp Converter** | Convert Unix timestamps ↔ human dates ↔ ISO 8601, with timezone support | Pure JS (Date API) | 0KB |
| **Unit Converter** | Length, weight, temperature, speed, data storage, time, area, volume | Pure JS | 0KB |
| **Number Base Converter** | Convert between decimal, hex, binary, octal (and arbitrary bases) | Pure JS | 0KB |
| **IP Address Tools** | IPv4/IPv6 converter, subnet calculator, CIDR notation, IP ↔ integer | Pure JS | 0KB |
| **Cron Expression Builder** | Visual builder for cron schedules with human-readable explanation | cronstrue (~20KB) + custom UI | ~20KB |
| **JWT Decoder** | Decode and inspect JSON Web Tokens (header, payload, expiry) without sending to any server | Pure JS (base64) | 0KB |
| **URL Parser** | Break down a URL into protocol, host, path, params, hash with encoding/decoding | Pure JS (URL API) | 0KB |
| **HTML Entity Encoder/Decoder** | Convert special characters ↔ HTML entities | Pure JS | 0KB |
| **User-Agent Parser** | Paste a user-agent string, get parsed browser, OS, device info | ua-parser-js (~20KB) | ~20KB |
| **Chmod Calculator** | Visual permission calculator for Unix file permissions | Pure JS | 0KB |

---

## TIER 3: "Nobody Else Has This" (Unique to ShipTools)

These tools DON'T exist as client-side browser tools anywhere. Building them = instant differentiation.

### Privacy-Specific (Unique to ShipTools brand)

| Tool | What It Does | Library | Why It's Unique |
|------|-------------|---------|----------------|
| **Document Redactor** | Upload a PDF/DOCX, auto-detect sensitive info (emails, phone numbers, SSNs, names via NER), redact with black boxes | pdf-lib + regex + optional Transformers.js NER | No one does this client-side. Lawyers, recruiters, HR people would love this. |
| **Privacy Policy Analyzer** | Paste a privacy policy URL, get a plain-English summary of what data they collect | Server-side fetch + client-side analysis | Extends the audit story. "What does their privacy policy ACTUALLY say?" |
| **Clipboard Cleaner** | Paste rich text, strip all hidden formatting, tracking pixels, embedded styles — output clean text | Pure JS (DOMParser) | Solves a real annoyance when copying from web/email |
| **Email Header Analyzer** | Paste email headers, trace the full server path, detect spoofing indicators | Pure JS parser | Privacy/security tool that IT people use daily |
| **File Signature Checker** | Upload any file, check if the extension matches the actual file type (magic bytes) | Pure JS (ArrayBuffer) | "Is this .jpg actually an .exe?" Security use case. |
| **What's In This File?** | Upload any file, show ALL metadata (EXIF for images, ID3 for audio, PDF metadata, DOCX author/revision history) | Multi-format parsers | Universal metadata inspector, privacy story |
| **Network Request Logger** | See what network requests your browser is making right now (without DevTools) | Performance Observer API | Lightweight, educational, privacy awareness |
| **Browser Fingerprint Viewer** | Show users their browser fingerprint (canvas, WebGL, fonts, plugins, timezone) and explain what it reveals | Pure JS | "See how trackable you are" — extremely shareable |
| **Tracking Pixel Detector** | Paste an email (HTML source), detect all tracking pixels and analytics beacons | Pure JS (HTML parser) | "See who's tracking when you open their emails" |

### Weird But Useful

| Tool | What It Does | Library | Why Build It |
|------|-------------|---------|-------------|
| **PDF → Presentation Extractor** | Extract slides from a PDF (1 page = 1 image), export as images or repackable deck | pdf-lib + Canvas | Reverse a "Save as PDF" for presentations |
| **Git Diff Viewer** | Paste a git diff, see it beautifully rendered with syntax highlighting | diff2html + Prism.js | Every developer copy-pastes diffs into Slack |
| **Mermaid Diagram Renderer** | Write Mermaid syntax, get instant rendered diagrams (flowcharts, sequences, ERDs) | mermaid.js | Useful documentation/planning tool |
| **ASCII Art Generator** | Convert any image to ASCII art text | Canvas API + character mapping | Fun, shareable, and privacy-friendly |
| **Pixel Art Editor** | Simple pixel art editor with export to PNG/GIF | Canvas API | Fun creative tool, works offline |
| **Music Visualizer** | Upload an audio file, generate visual waveform / frequency visualization | Web Audio API + Canvas | Cool demo of browser capabilities |
| **Audio Waveform Generator** | Generate waveform image from audio file (for social media, podcast thumbnails) | Web Audio API + Canvas | Creators need this — usually requires paid tools |
| **Metronome** | Simple metronome with BPM control | Web Audio API (Tone.js) | Tiny, useful, works offline |
| **Tuning Fork / Pitch Pipe** | Generate precise audio frequencies | Web Audio API | Musicians love this |
| **White Noise Generator** | Generate brown/white/pink noise for focus | Web Audio API | Productivity tool, works offline |
| **Color Blindness Simulator** | Upload an image, see how it looks to people with different types of color blindness | Canvas API + color matrix transforms | Accessibility use case, educational |
| **Morse Code Translator** | Text ↔ Morse code with audio playback | Pure JS + Web Audio API | Fun, educational, surprisingly useful for encoding |
| **Pomodoro Timer** | Simple focus timer with browser notifications | Pure JS | Everyone needs this, zero dependencies |
| **Countdown Timer / Stopwatch** | Basic but polished timer with laps | Pure JS | Surprisingly hard to find one that's not ad-infested |

### Power Tools (For Developers/Hackers)

| Tool | What It Does | Library | Size |
|------|-------------|---------|------|
| **Code Minifier** | Minify JavaScript, CSS, HTML | terser + cssnano + html-minifier | ~500KB |
| **Code Formatter (Prettier)** | Format code in 15+ languages | prettier standalone | ~2MB |
| **Code Screenshot (Carbon-like)** | Generate beautiful code screenshots with syntax highlighting and theming | Prism.js + Canvas/html-to-image | ~200KB |
| **robots.txt Generator** | Build robots.txt with visual rule builder | Pure JS | 0KB |
| **.htaccess Generator** | Generate Apache redirect rules visually | Pure JS | 0KB |
| **CSP Header Builder** | Visual Content Security Policy builder | Pure JS | 0KB |
| **CORS Header Tester** | Test if a URL returns proper CORS headers | fetch API | 0KB |
| **.env Validator** | Paste .env file, validate format, detect common mistakes, check for exposed secrets | Pure JS | 0KB |
| **Package.json Explorer** | Paste package.json, see dependency tree, sizes, license audit | Pure JS parser | 0KB |
| **SQL Formatter** | Pretty-print SQL queries with syntax highlighting | sql-formatter | ~50KB |
| **GraphQL Playground** | Write and test GraphQL queries | graphiql (lightweight) | ~500KB |
| **WebSocket Tester** | Connect to any WebSocket endpoint and send/receive messages | Native WebSocket API | 0KB |
| **API Response Formatter** | Paste any API response (JSON/XML/HTML), auto-detect format, pretty-print with syntax highlighting | Pure JS | 0KB |

---

## TIER 4: "Full Applications" (Ambitious, but possible)

These push the boundary of what a "tool" is — they're mini-apps that happen to run locally.

| Tool | What It Does | Library | Size | Notes |
|------|-------------|---------|------|-------|
| **Spreadsheet Editor** | Lightweight Excel-like editor in browser | x-spreadsheet or Luckysheet | ~500KB-2MB | Open, edit, save CSV/XLSX locally |
| **Whiteboard / Drawing** | Freehand drawing + shapes + text on infinite canvas | Excalidraw (open source) or tldraw | ~2MB | Both are MIT licensed and embeddable |
| **Diagram Editor** | Draw flowcharts, wireframes, network diagrams | Draw.io (open source, Apache 2.0) | ~5MB | This is basically mxGraph |
| **Presentation Viewer** | View .pptx files in browser | pptx2html or custom parser | ~500KB | PPTX → HTML rendering |
| **E-Book Reader** | Read .epub files in browser | epub.js | ~200KB | Privacy-friendly alternative to Kindle Cloud |
| **Photo Editor** | Crop, rotate, filter, adjust images | Canvas API + custom filters | ~100KB | A mini Photopea |
| **Audio Recorder** | Record microphone audio, trim, export | MediaRecorder API + Web Audio | 0KB (native) | Useful utility, works offline |
| **Screen Recorder** | Record screen/tab + audio, export as WebM | getDisplayMedia API | 0KB (native) | No need for Loom if just capturing |
| **Camera Scanner** | Use device camera to scan documents | getUserMedia + Canvas + edge detection | 0KB (native) | CamScanner but private |

---

## SUMMARY: Total Tool Count

| Tier | Count | Bundle Impact |
|------|-------|--------------|
| Already in PRD (v1.1) | 15 | ~34MB (WASM) + ~640KB (JS) |
| Tier 1: "Wait, that runs in a browser?" | 15 | Heavy (AI models ~40-500MB each, lazy loaded) |
| Tier 2: "Every developer needs this" | 40+ | Minimal (most are pure JS, 0KB) |
| Tier 3: "Nobody else has this" | 30+ | Mostly minimal, a few medium |
| Tier 4: "Full applications" | 9 | Medium-large (embeddable open source apps) |
| **Total possible** | **~115 tools** | Managed via aggressive lazy loading |

---

## TOP 10 RECOMMENDATIONS TO ADD NEXT

Ranked by: (viral potential × ease of implementation × uniqueness)

1. **Browser Fingerprint Viewer** — Pure JS, 0KB, extremely shareable ("see how trackable you are"), perfect brand fit
2. **Speech-to-Text (Whisper)** — Transformers.js, ~75MB model, "transcribe without uploading" is a killer pitch
3. **Background Removal** — Transformers.js, ~40MB, proven demand (remove.bg is a unicorn)
4. **Code Screenshot Generator** — Prism.js + Canvas, ~200KB, every developer shares code on social media
5. **Favicon Generator** — Canvas + JSZip, ~100KB, every developer needs this, SEO opportunity
6. **Tracking Pixel Detector** — Pure JS, 0KB, paste email HTML and see who's watching — extremely shareable
7. **Document Redactor** — pdf-lib + regex, ~300KB, nobody does this client-side, massive privacy story
8. **Color Blindness Simulator** — Canvas, 0KB, accessibility angle, educational, shareable before/after
9. **Git Diff Viewer** — diff2html, ~100KB, practical developer utility
10. **Browser Fingerprint + Invisible Character Detector + Clipboard Cleaner** — These three tiny pure-JS tools are the "easter eggs" that make people explore ShipTools and discover more
