## ⚠️ MANDATORY — Execute Before Every Task

You MUST complete these steps before writing ANY code, creating ANY file, or
executing ANY command. This is not optional. Do not skip. Do not summarize.

### Step 1: Skill Loading (Atomic — Do All At Once)
Load ALL of the following skills using the Skill tool. Do NOT use Read().
These are non-negotiable for every task in this project:

- `/frontend-design` — ALL UI implementation
- `/vibesec` — ANY code touching user input, API responses, env vars, auth, RLS, or HTML rendering
- `/web-dev` — Next.js/React/TypeScript implementation
- `/backend-architect` — API routes, DB schema, auth flows

### Step 2: Task-Specific Skill Loading
Based on the current task, ALSO load the matching skill:

| If the task involves... | Also load |
|---

## Session Management

### On Session Start
1. Run `/context` — verify effective context > 150K tokens. If below, check disabled MCPs.
2. Check `.claude/sessions/` for the most recent session state file.
   - If found: read it, summarize what was in progress, confirm with user before continuing.
   - If not found: this is a fresh start. Ask user which PRD phase/task to begin.

### On Session End
The Stop hook auto-creates a session state file in `.claude/sessions/`.
Before ending: fill in the TODO section of that file (current task, blockers, next action).

-------------------------|-----------|
| Next.js pages, React components, TypeScript | `/web-dev` |
| API routes, database schema, auth flows | `/backend-architect` |
| Complex interactive components, state mgmt | `/frontend-developer` |
| Data visualizations, charts, infographics | `/visual-storyteller` |
| Mobile-responsive layouts, touch targets | `/mobile-ux-optimizer` |
| Launch prep, deployment, GTM | `/project-shipper` |
| Design system, multi-variant exploration | `/superdesign` |

### Step 3: Confirm Before Proceeding
Before starting work, output:

SKILLS LOADED:
- [list each skill loaded]
TASK: [one-line description of what you're about to do]
PHASE: [current PRD phase]

Do NOT proceed until this confirmation is output.

---

# BrowserShip

Local-first productivity suite. 38+ developer tools, file converters, privacy auditor, and AI-powered assistants — all running in your browser. No uploads, no tracking.

## Stack

- Next.js 16, React 19, Tailwind CSS 4 (`@theme` — non-inline for runtime light/dark switching)
- TypeScript strict mode
- Supabase backend (graceful null when env vars missing → 503)
- Puppeteer (`puppeteer-core` + `@sparticuz/chromium`) for privacy scanning
- wasm-vips (CDN) for image conversion, ffmpeg.wasm for audio
- pdf-lib + mammoth + papaparse for document conversion
- WebLLM (@mlc-ai/web-llm) for in-browser AI inference
- Vercel deployment (Pro plan required for >10s function duration)

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — lint

## Architecture

- `src/lib/scanner/` — Puppeteer-based privacy scanner (server-only)
- `src/lib/grading.ts` — Weighted scoring → A-F grade
- `src/lib/ai/` — WebLLM engine, Ollama detection, AI prompts
- `src/components/*Converter.tsx` — Client-side WASM converters
- `src/hooks/useConverter.ts` — Shared job queue for all converters
- `src/hooks/useLocalAI.ts` — React hook for AI state management

## Key Patterns

- **COOP/COEP scoped to `/convert/*` only** — required for SharedArrayBuffer (ffmpeg.wasm), but breaks third-party resources on other pages
- **WASM lazy-loaded** — wasm-vips and ffmpeg.wasm load only when user visits that converter tab
- **AI lazy-loaded** — WebLLM model downloads only when user clicks "Load AI Model"
- **Supabase graceful null** — all API routes work without Supabase configured
- **SSRF prevention** — DNS resolution + private IP rejection before Puppeteer launch
- **Rate limiting** — in-memory sliding window (10 scans/IP/hour)

## Supabase Tables (bs_ prefix)

- `bs_audits` — cached scan results (24h TTL)
- `bs_audit_requests` — user audit requests (hashed IP)
- `bs_analytics_events` — fire-and-forget events (service-role only)
- `bs_analytics_daily` — daily rollup from raw events

## Environment Variables

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase features
- `IP_HASH_SALT` — salt for IP hashing (optional, has default)


---

## Model Routing

**Default: Sonnet** for all routine work in this project.

**Use Opus ONLY for:**
- Initial scaffold from PRD (first build only)
- Cross-file refactors spanning 5+ files
- Auth/RLS policy design
- Debugging multi-file issues after Sonnet failed

**Never use Opus for:**
- Copy/text changes, Tailwind adjustments
- Single-file component work following existing patterns
- README or doc updates
- Adding environment variables

---

## Project Conventions — Non-Negotiable

### Table Prefix: `bs_`

ALL Supabase tables use `bs_` prefix.
ALL domain-specific columns use `bs_` prefix.
Standard columns (id, user_id, created_at, updated_at) are NEVER prefixed.

### Auth: Supabase Auth ONLY

- Package: `@supabase/ssr` (NOT `@supabase/auth-helpers` — it's deprecated)
- Auth checks: `getUser()` ALWAYS — NEVER `getSession()`
- RLS: `auth.uid()` for row-level access
- DO NOT use Clerk. DO NOT use any other auth provider.

### Analytics: Supabase Tables ONLY

- Raw events table: `bs_analytics_events`
- Daily rollup table: `bs_analytics_daily`
- DO NOT use Umami. DO NOT add any third-party analytics script.

### Environment Variables

- File: `.env.local` — NEVER `.env`
- `SUPABASE_SERVICE_ROLE_KEY`: server-side ONLY (API routes, server components)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: client-safe, used with RLS

---

## Verification Checklist — Run Before Committing

- [ ] Required skills were loaded before writing code (check session output)
- [ ] All tables use `bs_` prefix
- [ ] RLS is enabled on every new table
- [ ] Auth uses `getUser()`, never `getSession()`
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` in client code
- [ ] No `console.log` statements in production code
- [ ] `.env.local` used, not `.env`
- [ ] `/vibesec` skill was run against any code handling user input or auth