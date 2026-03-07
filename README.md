# Uploadless

Privacy-first browser tools. Zero uploads. Everything runs locally.

## What is Uploadless?

Uploadless is an open-source collection of browser-native tools that process your files entirely on your device. Nothing leaves your browser — no uploads, no tracking, no accounts required.

**Try it:** [uploadless.dev](https://uploadless.dev)

## Departments

| Department | What's inside |
|------------|---------------|
| **Write** | AI-powered text tools, markdown editors, document converters |
| **Code** | Developer utilities, formatters, encoders, generators |
| **Media** | Image/audio/video converters, screen recorder, PDF signer |
| **Protect** | Privacy auditor, EXIF stripper, file encryption, metadata tools |

## Privacy Auditor

The flagship tool scans any website and generates a privacy report card (A–F grade) based on cookies, third-party domains, and trackers found. It's the only tool that requires a server — everything else runs client-side.

## Stack

- **Framework:** Next.js 16, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (optional — app works without it)
- **WASM:** wasm-vips (images), ffmpeg.wasm (audio/video)
- **AI:** WebLLM for in-browser inference (no server needed)
- **Scanning:** Puppeteer + Chromium (server-side, for audits only)
- **Deployment:** Vercel

## Getting Started

```bash
git clone https://github.com/jerrysoer/uploadless.git
cd uploadless
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Supabase is optional — all tools work without it. API routes gracefully return 503 when Supabase is not configured.

## Development

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run lint      # Lint
npx tsc --noEmit  # Type check
```

## Architecture Highlights

- **COOP/COEP scoped to `/convert/*`** — SharedArrayBuffer for ffmpeg.wasm without breaking other pages
- **Lazy-loaded WASM** — wasm-vips and ffmpeg.wasm load only when needed
- **Lazy-loaded AI** — WebLLM models download only on user action
- **SSRF prevention** — DNS resolution + private IP rejection before Puppeteer launch
- **Rate limiting** — Sliding window (10 scans/IP/hour)

## License

MIT — see [LICENSE](LICENSE)
