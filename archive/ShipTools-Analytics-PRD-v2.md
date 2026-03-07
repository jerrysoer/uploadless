# PRD: ShipTools Analytics — Transparent Telemetry

**Version:** 2.0
**Date:** March 5, 2026
**Parent PRD:** ShipTools v1.1 (Privacy Auditor & Browser-Native Toolkit)
**Table Prefix:** `st_`
**Status:** Ready for build

---

## 1. Problem & Angle

### Problem
ShipTools needs usage analytics to understand which tools are popular, where traffic comes from, and whether the product retains users. But ShipTools is an open-source privacy product — its entire brand is "your data never leaves your browser." Using Google Analytics, Hotjar, or any third-party tracker would be hypocritical and brand-destroying. Even privacy-friendly services like Umami Cloud or Plausible still send data to third-party servers, which contradicts the zero-upload promise.

### Unique Angle
**Transparent Telemetry** — instead of hiding analytics like every other tool, ShipTools shows users exactly what it tracks, provides a one-click opt-out, makes the analytics code open source and auditable, and publishes aggregated stats publicly. The analytics implementation becomes a trust signal and marketing asset, not a liability.

### Design Principles

1. **Minimal by default.** Collect the least data needed to make product decisions. If in doubt, don't collect it.
2. **No content data, ever.** Never log file names, file contents, file sizes, file types, text input, or any user-generated content.
3. **No persistent identity.** No cookies, no cross-session tracking, no user fingerprinting. Session IDs are ephemeral (tab-scoped).
4. **Country, not location.** Derive 2-letter country code server-side from the IP, then immediately discard the IP. Never store IP addresses.
5. **Category, not raw data.** Store "mobile" not the full user-agent string. Store "twitter.com" not the full referrer URL.
6. **Opt-out means zero.** When a user opts out, literally zero analytics events fire. Not "reduced" — zero.
7. **Open source and auditable.** The entire analytics module is in `src/lib/analytics/`, readable by anyone.
8. **Transparency is a feature.** A public `/transparency` page shows exactly what's collected, with a live preview.

---

## 2. Core Features (Phased)

### Phase 1 — Minimal Telemetry + Opt-Out (Ships with ShipTools v1)

**A1: Client-Side Event Tracker**
- Lightweight `track()` function in `src/lib/analytics/track.ts`
- Fire-and-forget via `navigator.sendBeacon()` (survives page close, non-blocking)
- Falls back to `fetch()` with `keepalive: true` if sendBeacon unavailable
- Wrapped in try/catch — analytics failure NEVER affects app functionality
- Checks `localStorage` opt-out flag before every event
- Generates ephemeral session ID (UUID v4) on first event per tab, not persisted to storage
- **Acceptance criteria:**
  - `track()` adds <1ms to any user interaction
  - Zero impact on Lighthouse performance score
  - Works when JavaScript modules load async (no race conditions)
  - Graceful degradation: if `/api/analytics/event` is down, events are silently dropped

**A2: Server-Side Event Receiver**
- `POST /api/analytics/event` — receives events from the client
- Extracts country from Vercel `x-vercel-ip-country` header
- **Discards the IP address immediately** — never written to database, never logged, never passed to any downstream service
- Validates event payload (reject malformed events, enforce max property size)
- Inserts into `st_analytics_events` table via Supabase service role
- Rate limited: max 50 events per session ID per hour (prevent abuse/spam)
- **Acceptance criteria:**
  - Response time <100ms (insert and return, no blocking)
  - IP address provably never stored (code review checkpoint)
  - Rejects events with properties >1KB (prevents abuse)
  - Returns 200 even on rate limit (client doesn't need to know)

**A3: Consent Banner + Opt-Out**
- Minimalist banner on first visit (not a modal, not a popup — an inline banner at page bottom)
- Banner text:

  ```
  ShipTools collects anonymous usage stats (which tools are popular, 
  where visitors come from) to improve the product. No files, no IPs, 
  no cookies, no cross-session tracking. [See exactly what we track]
  
  [OK]  [No thanks — turn off telemetry]
  ```

- "OK" dismisses banner, sets `localStorage.st_telemetry_consent = 'accepted'`
- "No thanks" dismisses banner, sets `localStorage.st_telemetry_opt_out = 'true'`
- Once dismissed (either choice), banner never shows again
- Footer link: "Analytics: On ✓" or "Analytics: Off" — clicking toggles the state
- **No dark patterns:**
  - Both buttons same size, same visual weight
  - "No thanks" is not grayed out, not smaller, not hidden
  - No "are you sure?" confirmation on opt-out
  - No countdown, no delay, no guilt text
- **Acceptance criteria:**
  - Banner renders in <50ms (no layout shift)
  - Opt-out immediately stops all tracking (not "after next page load")
  - Banner never reappears after dismissal
  - Works without JavaScript (banner hidden via CSS, telemetry disabled by default if JS fails)
  - Toggling via footer link takes effect instantly, no page reload

**A4: Event Schema (7 Events)**

| Event Name | Type | Properties | When Fired |
|-----------|------|-----------|------------|
| `page_view` | `page_view` | `{}` | Every client-side route navigation |
| `tool_opened` | `action` | `{ tool: string }` | User navigates to a specific tool page |
| `tool_used` | `action` | `{ tool: string, completed: boolean }` | User actually processes a file or runs a tool operation |
| `scan_initiated` | `action` | `{ domain: string }` | User starts a privacy audit scan |
| `scan_completed` | `action` | `{ domain: string, grade: string }` | Audit scan finishes with a result |
| `report_shared` | `action` | `{ method: 'copy_link' \| 'download_png' }` | User shares or downloads an audit report card |
| `telemetry_opted_out` | `action` | `{}` | User opts out of telemetry (last event ever sent for this session) |

**Intentionally NOT tracked:**
- File names, sizes, types, or contents
- Conversion parameters (quality, format, dimensions)
- Text typed into any tool (JSON, passwords, URLs beyond audit domain)
- Search queries within the tool picker
- Click coordinates or scroll depth
- Mouse movements or hover patterns
- Error stack traces or console logs
- Browser fingerprint signals

### Phase 2 — Aggregation + Admin Dashboard (Ships 1 sprint after v1)

**A5: Daily Aggregation Cron**
- Vercel cron job at `/api/analytics/aggregate` running at 03:00 UTC daily
- Rolls raw `st_analytics_events` into `st_analytics_daily` summaries
- Aggregated metrics:

  | Metric | Dimensions | Calculation |
  |--------|-----------|-------------|
  | `unique_sessions` | `{ country?, device_type? }` | COUNT(DISTINCT st_session_id) |
  | `page_views` | `{ page_path? }` | COUNT(*) WHERE st_event_name = 'page_view' |
  | `tool_opens` | `{ tool }` | COUNT(*) WHERE st_event_name = 'tool_opened' |
  | `tool_completions` | `{ tool }` | COUNT(*) WHERE st_event_name = 'tool_used' AND properties->>'completed' = 'true' |
  | `conversion_rate` | `{ tool }` | tool_completions / tool_opens |
  | `scans_completed` | `{ grade? }` | COUNT(*) WHERE st_event_name = 'scan_completed' |
  | `reports_shared` | `{ method? }` | COUNT(*) WHERE st_event_name = 'report_shared' |
  | `avg_session_duration` | `{}` | AVG of (last event timestamp - first event timestamp) per session |
  | `opt_out_rate` | `{}` | sessions with opt_out event / total sessions |
  | `referrer_breakdown` | `{ referrer_domain }` | COUNT(DISTINCT st_session_id) grouped by referrer |

- **Data retention:** Raw events (`st_analytics_events`) purged after 30 days. Aggregated daily stats (`st_analytics_daily`) kept indefinitely.
- **Acceptance criteria:**
  - Cron completes in <30 seconds for up to 100K daily events
  - Aggregation is idempotent (safe to re-run)
  - Raw event purge runs after successful aggregation only

**A6: Admin Analytics Dashboard**
- Available at `/admin/analytics` (protected by Supabase auth — your account only)
- Reads from `st_analytics_daily` table (aggregated data, never raw events)
- Dashboard sections:

  **Overview (top of page):**
  - Unique sessions today / this week / this month (sparkline trend)
  - Total tool uses today / this week / this month
  - Opt-out rate (current %)

  **Tool Popularity (bar chart + table):**
  - Ranked list of tools by `tool_completions` (actual usage, not just opens)
  - Conversion funnel per tool: `tool_opened` → `tool_used (completed: true)`
  - Identifies tools with high open rate but low completion (UX problem signal)

  **Geography (country heatmap):**
  - World map colored by session count per country
  - Table: top 20 countries by sessions
  - Note: 2-letter country codes only, no city/region granularity

  **Traffic Sources (pie chart + table):**
  - Referrer domain breakdown
  - Useful for measuring launch post impact (linkedin.com, twitter.com, reddit.com, news.ycombinator.com)

  **Device Split (donut chart):**
  - Desktop / Mobile / Tablet %
  - Informs which tools need mobile optimization

  **Privacy Audit Stats:**
  - Scans per day trend
  - Grade distribution (how many A/B/C/D/F grades issued)
  - Most-scanned domains
  - Report share rate (reports shared / scans completed)

  **Session Duration:**
  - Average session duration trend
  - Distribution histogram (how many sessions last <30s, 30s-2min, 2-5min, 5min+)

  **Engagement Funnel:**
  - Landing page → any tool opened → tool used → report shared
  - Weekly funnel visualization

- **Acceptance criteria:**
  - Dashboard loads in <2 seconds
  - All charts render from `st_analytics_daily` data (no real-time queries against raw events)
  - Date range picker: last 7 days, 30 days, 90 days, custom range
  - Export dashboard data as CSV

### Phase 3 — Public Transparency + Launch Content (Ships with Phase 2 GTM)

**A7: Public Transparency Page**
- Available at `/transparency` — no auth required, anyone can view
- Sections:

  **"What We Track" (exact schema):**
  - Table showing every event name, every property, with plain-English descriptions
  - Example JSON payload for each event
  - Explicit list of what is NOT collected

  **"Live Telemetry Preview":**
  - Shows the user, in real-time, the exact events their current session is generating
  - Works even if the user has opted out (shows "these events WOULD be sent if telemetry were on")
  - Events displayed as a scrolling JSON log, syntax highlighted
  - This is the "prove it" feature — lets any developer verify the claims

  **"Public Stats" (aggregated, anonymous):**
  - Total tool uses this week
  - Most popular tools (ranked)
  - Country distribution (top 10)
  - Total privacy scans completed
  - Average grade issued
  - Opt-out rate
  - Updated daily from `st_analytics_daily`

  **"How We Compare":**
  - Comparison table: ShipTools telemetry vs. typical free tool tracking
  
  | | ShipTools | Typical Free Tool |
  |-|-----------|------------------|
  | Cookies set | 0 | 50-600+ |
  | Third-party domains contacted | 0 | 20-200+ |
  | IP address stored | Never | Usually |
  | Session recording | Never | Often (Hotjar, FullStory) |
  | Ad networks | 0 | 3-10+ |
  | File contents accessible | Never (client-side only) | Yes (server-side processing) |
  | Opt-out available | Yes, one click | Rarely |
  | Analytics code open source | Yes | Never |
  | Cross-session tracking | None | Extensive |

  **"Audit Our Analytics":**
  - Direct link to `src/lib/analytics/track.ts` on GitHub
  - Direct link to `/api/analytics/event/route.ts` on GitHub
  - Invitation: "Found something we should change? Open an issue."

- **Acceptance criteria:**
  - Page loads without JavaScript (static content, SSR)
  - Live telemetry preview updates in real-time via local event listener (not polling)
  - Public stats refresh daily (cached, not computed on page load)
  - Page has proper OG tags for sharing ("See exactly what ShipTools tracks")

---

## 3. Data Architecture

### Updated Schema

The v1.1 PRD defined placeholder analytics tables. This PRD replaces them with a privacy-hardened schema.

```sql
-- ============================================================
-- RAW EVENTS (written by client via API, rolled up daily)
-- Retention: 30 days, then purged after aggregation
-- ============================================================

DROP TABLE IF EXISTS st_analytics_events;
CREATE TABLE st_analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Session identity (ephemeral, tab-scoped, not persistent)
  st_session_id TEXT NOT NULL,

  -- Event classification
  st_event_type TEXT NOT NULL 
    CHECK (st_event_type IN ('page_view', 'action')),
  st_event_name TEXT NOT NULL 
    CHECK (st_event_name IN (
      'page_view', 
      'tool_opened', 
      'tool_used', 
      'scan_initiated', 
      'scan_completed', 
      'report_shared', 
      'telemetry_opted_out'
    )),

  -- Context (all privacy-safe: category-level only)
  st_page_path TEXT,                    -- e.g., '/convert/images'
  st_referrer_domain TEXT,              -- e.g., 'twitter.com' (domain only, not full URL)
  st_device_type TEXT                   
    CHECK (st_device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  st_country CHAR(2),                  -- ISO 3166-1 alpha-2 (e.g., 'US', 'DE')
                                       -- Derived server-side from Vercel header
                                       -- IP NEVER stored

  -- Event-specific properties (constrained, no free-form user content)
  st_properties JSONB DEFAULT '{}' 
    CHECK (octet_length(st_properties::text) <= 1024),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for aggregation queries
CREATE INDEX st_events_session_idx ON st_analytics_events (st_session_id);
CREATE INDEX st_events_name_created_idx ON st_analytics_events (st_event_name, created_at);
CREATE INDEX st_events_created_idx ON st_analytics_events (created_at);

-- NOTE: No user_id column. No auth reference. 
-- ShipTools Phase 1 is anonymous-only. Even when auth is added in Phase 2,
-- analytics events are NEVER linked to authenticated users.


-- ============================================================
-- DAILY AGGREGATES (computed by cron, used for dashboard)
-- Retention: indefinite
-- ============================================================

DROP TABLE IF EXISTS st_analytics_daily;
CREATE TABLE st_analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  st_date DATE NOT NULL,
  st_metric TEXT NOT NULL,               -- e.g., 'unique_sessions', 'tool_completions'
  st_value NUMERIC(12,2) NOT NULL,
  st_dimensions JSONB DEFAULT '{}',      -- e.g., { "tool": "image-converter" } or { "country": "US" }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(st_date, st_metric, st_dimensions)
);

CREATE INDEX st_daily_date_metric_idx ON st_analytics_daily (st_date, st_metric);


-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Raw events: insert via anon key (client fire-and-forget), no public read
ALTER TABLE st_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous event inserts" ON st_analytics_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "No public reads on raw events" ON st_analytics_events
  FOR SELECT TO anon USING (false);

-- Daily aggregates: read via service role only (admin dashboard)
-- Exception: public stats page reads a subset via a Supabase function
ALTER TABLE st_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role reads daily stats" ON st_analytics_daily
  FOR SELECT TO service_role USING (true);

-- Public stats function (returns only aggregated, non-sensitive metrics)
CREATE OR REPLACE FUNCTION st_public_stats()
RETURNS TABLE (
  metric TEXT,
  value NUMERIC,
  dimensions JSONB,
  date DATE
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT st_metric, st_value, st_dimensions, st_date
  FROM st_analytics_daily
  WHERE st_date >= CURRENT_DATE - INTERVAL '7 days'
    AND st_metric IN (
      'unique_sessions', 
      'tool_completions', 
      'scans_completed',
      'opt_out_rate'
    )
  ORDER BY st_date DESC, st_metric;
$$;
```

### What Is NOT In the Schema

Documenting what's absent is as important as what's present for a privacy product:

| Column | Why It's Absent |
|--------|----------------|
| `user_id` | No auth linkage. Even post-auth, analytics stay anonymous. |
| `ip_address` | Never stored. Country derived server-side, IP discarded. |
| `user_agent` | Never stored. Device type category derived client-side. |
| `full_referrer_url` | Never stored. Domain extracted client-side, path stripped. |
| `file_name` / `file_size` / `file_type` | Never stored. Tool usage is boolean (used/not used). |
| `browser` / `os` / `screen_size` | Never stored. Would enable fingerprinting. |
| `latitude` / `longitude` / `city` | Never stored. Country-level only. |
| `cookie_id` / `persistent_id` | Never stored. No cross-session tracking. |

---

## 4. Implementation Spec

### File Structure

```
src/lib/analytics/
├── track.ts                   ← Client-side tracking function
├── consent.ts                 ← Opt-in/opt-out state management  
├── session.ts                 ← Ephemeral session ID generation
├── parse.ts                   ← Referrer domain extraction, device type detection
└── events.ts                  ← Event name constants and property types

src/components/analytics/
├── ConsentBanner.tsx           ← First-visit telemetry consent banner
├── TelemetryToggle.tsx         ← Footer toggle (Analytics: On/Off)
├── LiveTelemetryPreview.tsx    ← Real-time event log for /transparency page
└── PublicStats.tsx             ← Aggregated stats display for /transparency page

src/app/
├── transparency/
│   └── page.tsx               ← Public transparency page
├── admin/
│   └── analytics/
│       └── page.tsx           ← Protected admin dashboard
├── api/
│   └── analytics/
│       ├── event/route.ts     ← POST: receive events from client
│       ├── aggregate/route.ts ← CRON: daily aggregation
│       └── public/route.ts    ← GET: public stats for transparency page
```

### Client-Side Implementation

#### `src/lib/analytics/session.ts`

```typescript
// Ephemeral session ID — scoped to the current tab, not persisted
let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

// Session ID dies when the tab closes. No localStorage, no cookies.
```

#### `src/lib/analytics/consent.ts`

```typescript
const OPT_OUT_KEY = 'st_telemetry_opt_out';
const CONSENT_KEY = 'st_telemetry_consent';

export function isOptedOut(): boolean {
  if (typeof window === 'undefined') return true; // SSR: no tracking
  return localStorage.getItem(OPT_OUT_KEY) === 'true';
}

export function hasSeenBanner(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    localStorage.getItem(CONSENT_KEY) !== null ||
    localStorage.getItem(OPT_OUT_KEY) !== null
  );
}

export function acceptTelemetry(): void {
  localStorage.setItem(CONSENT_KEY, 'accepted');
  localStorage.removeItem(OPT_OUT_KEY);
}

export function optOut(): void {
  localStorage.setItem(OPT_OUT_KEY, 'true');
  localStorage.removeItem(CONSENT_KEY);
}

export function optIn(): void {
  localStorage.removeItem(OPT_OUT_KEY);
  localStorage.setItem(CONSENT_KEY, 'accepted');
}

export function getStatus(): 'on' | 'off' | 'unseen' {
  if (typeof window === 'undefined') return 'off';
  if (localStorage.getItem(OPT_OUT_KEY) === 'true') return 'off';
  if (localStorage.getItem(CONSENT_KEY) === 'accepted') return 'on';
  return 'unseen';
}
```

#### `src/lib/analytics/parse.ts`

```typescript
// Extract domain only from referrer — never store full URL
export function getReferrerDomain(): string | null {
  try {
    const ref = document.referrer;
    if (!ref) return null;
    return new URL(ref).hostname;
  } catch {
    return null;
  }
}

// Derive device category from screen size — never store user-agent
export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
```

#### `src/lib/analytics/track.ts`

```typescript
import { isOptedOut } from './consent';
import { getSessionId } from './session';
import { getReferrerDomain, getDeviceType } from './parse';
import type { AnalyticsEvent } from './events';

// Local event bus for the Live Telemetry Preview on /transparency
type EventListener = (event: AnalyticsEvent & { _sent: boolean }) => void;
const listeners: EventListener[] = [];

export function onTrack(fn: EventListener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function track(
  eventName: string,
  eventType: 'page_view' | 'action' = 'action',
  properties?: Record<string, string | number | boolean>
): void {
  const payload = {
    st_event_name: eventName,
    st_event_type: eventType,
    st_session_id: getSessionId(),
    st_page_path: typeof window !== 'undefined' ? window.location.pathname : null,
    st_referrer_domain: getReferrerDomain(),
    st_device_type: getDeviceType(),
    st_properties: properties || {},
  };

  const optedOut = isOptedOut();

  // Always notify local listeners (for Live Telemetry Preview)
  // This lets users on /transparency see events even when opted out
  listeners.forEach(fn => fn({ ...payload, _sent: !optedOut }));

  // If opted out, stop here. No network request.
  if (optedOut) return;

  // Fire-and-forget. Never blocks UI. Never throws.
  try {
    const body = JSON.stringify(payload);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/event', body);
    } else {
      fetch('/api/analytics/event', {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {}); // Silently swallow errors
    }
  } catch {
    // Analytics failure NEVER affects the app
  }
}

// Convenience wrappers
export const trackPageView = () => track('page_view', 'page_view');
export const trackToolOpened = (tool: string) => track('tool_opened', 'action', { tool });
export const trackToolUsed = (tool: string, completed: boolean) => 
  track('tool_used', 'action', { tool, completed });
export const trackScanInitiated = (domain: string) => 
  track('scan_initiated', 'action', { domain });
export const trackScanCompleted = (domain: string, grade: string) => 
  track('scan_completed', 'action', { domain, grade });
export const trackReportShared = (method: 'copy_link' | 'download_png') => 
  track('report_shared', 'action', { method });
export const trackOptOut = () => track('telemetry_opted_out', 'action');
```

#### `src/lib/analytics/events.ts`

```typescript
// Strict type definitions — constrains what can be tracked

export const EVENT_NAMES = [
  'page_view',
  'tool_opened',
  'tool_used',
  'scan_initiated',
  'scan_completed',
  'report_shared',
  'telemetry_opted_out',
] as const;

export type EventName = typeof EVENT_NAMES[number];

export interface AnalyticsEvent {
  st_event_name: EventName;
  st_event_type: 'page_view' | 'action';
  st_session_id: string;
  st_page_path: string | null;
  st_referrer_domain: string | null;
  st_device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  st_properties: Record<string, string | number | boolean>;
}

// Property constraints per event (enforced at type level)
export interface EventPropertyMap {
  page_view: {};
  tool_opened: { tool: string };
  tool_used: { tool: string; completed: boolean };
  scan_initiated: { domain: string };
  scan_completed: { domain: string; grade: string };
  report_shared: { method: 'copy_link' | 'download_png' };
  telemetry_opted_out: {};
}
```

### Server-Side Implementation

#### `src/app/api/analytics/event/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { EVENT_NAMES } from '@/lib/analytics/events';
import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit map (resets on cold start, good enough for abuse prevention)
const sessionEventCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_EVENTS_PER_SESSION_PER_HOUR = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ---- Validate event name ----
    if (!EVENT_NAMES.includes(body.st_event_name)) {
      return NextResponse.json({ ok: true }); // Silent rejection
    }

    // ---- Validate properties size ----
    if (JSON.stringify(body.st_properties || {}).length > 1024) {
      return NextResponse.json({ ok: true }); // Silent rejection
    }

    // ---- Rate limit per session ----
    const sessionId = body.st_session_id;
    if (sessionId) {
      const now = Date.now();
      const entry = sessionEventCounts.get(sessionId);
      if (entry && entry.resetAt > now) {
        if (entry.count >= MAX_EVENTS_PER_SESSION_PER_HOUR) {
          return NextResponse.json({ ok: true }); // Silent rejection
        }
        entry.count++;
      } else {
        sessionEventCounts.set(sessionId, { 
          count: 1, 
          resetAt: now + 3600000 
        });
      }
    }

    // ---- Extract country from Vercel header ----
    // IP address is in the request but we NEVER store it.
    // We extract the 2-letter country code and discard everything else.
    const country = request.headers.get('x-vercel-ip-country') || null;

    // ---- Insert event ----
    const supabase = await createClient();
    await supabase.from('st_analytics_events').insert({
      st_session_id: body.st_session_id,
      st_event_type: body.st_event_type,
      st_event_name: body.st_event_name,
      st_page_path: body.st_page_path,
      st_referrer_domain: body.st_referrer_domain,
      st_device_type: body.st_device_type,
      st_country: country,
      st_properties: body.st_properties || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never expose errors. Always return 200.
    return NextResponse.json({ ok: true });
  }
}
```

### Integration Points

Where `track()` calls should be placed in the ShipTools app:

| Location | Event | Implementation |
|----------|-------|----------------|
| `src/app/layout.tsx` | `page_view` | In a `useEffect` on `pathname` change via `usePathname()` |
| Each tool page (`/convert/images`, `/dev/json`, etc.) | `tool_opened` | In `useEffect` on mount, passing tool slug |
| Each tool's "process/convert/run" handler | `tool_used` | After processing completes (pass `completed: true/false`) |
| Audit scan button handler | `scan_initiated` | On button click, before API call |
| Audit scan result display | `scan_completed` | After result renders, with domain and grade |
| Share/download button handlers | `report_shared` | On click, with method type |
| Consent banner "No thanks" handler | `telemetry_opted_out` | Fires once, then telemetry shuts off |

---

## 5. Success Criteria

### Phase 1 "Done" Definition

- [ ] `track()` function works with zero impact on Lighthouse performance
- [ ] Events reach `st_analytics_events` table with country code populated
- [ ] IP address is provably never stored (manual code audit + search for IP-related columns)
- [ ] Opt-out via banner immediately stops all event emission (testable: toggle, check network tab)
- [ ] Footer shows "Analytics: On ✓" / "Analytics: Off" with working toggle
- [ ] Opted-out users see zero `sendBeacon` or `fetch` calls to `/api/analytics/event` in DevTools
- [ ] Raw event count stays manageable (<10 events per average session)
- [ ] Rate limiting prevents >50 events per session per hour

### Phase 2 "Done" Definition

- [ ] Daily aggregation cron runs successfully and populates `st_analytics_daily`
- [ ] Raw events older than 30 days are purged after aggregation
- [ ] Admin dashboard loads in <2 seconds with charts for all specified metrics
- [ ] Dashboard accurately shows: tool popularity, geography, traffic sources, device split, session duration
- [ ] Date range picker works for 7/30/90 day windows

### Phase 3 "Done" Definition

- [ ] `/transparency` page renders with exact event schema, live preview, public stats, and comparison table
- [ ] Live Telemetry Preview shows real-time events (including when opted out, marked as "would not send")
- [ ] Public stats update daily and are accessible without auth
- [ ] GitHub links to analytics source code are correct and functional
- [ ] Transparency page has proper OG tags for social sharing

---

## 6. Claude Code Skills to Use

- `/frontend-design` — Consent banner design (must feel non-intrusive, match dark theme), admin dashboard charts, transparency page layout
- `/web-dev` — Next.js App Router integration, `usePathname()` tracking, Vercel cron setup
- `/backend-architect` — Supabase schema, RLS policies, aggregation queries, rate limiting
- `/vibesec` — **Critical.** Audit that: IP is never stored, no fingerprinting signals are collected, opt-out is complete, RLS prevents public read of raw events, event receiver can't be abused for data injection
- `/code-reviewer` — Review entire `src/lib/analytics/` module before shipping

---

## 7. GTM / Content Value

The analytics implementation creates three pieces of launch content:

1. **LinkedIn post:** "Most free tools hide what they track. ShipTools shows you everything — and lets you turn it off." Link to `/transparency`.

2. **Technical blog post / HN submission:** "How we built privacy-respecting analytics for an open-source privacy tool" — covers the design principles, what we chose NOT to collect, and why. Technical audience loves this.

3. **Comparison content:** "ShipTools collects 7 events. iLovePDF sets 637 cookies." — screenshot of the comparison table from `/transparency` becomes a shareable image.

The `/transparency` page is not just compliance — it's marketing.

---

## 8. README Section

Include in the open source repository README:

```markdown
## Analytics & Telemetry

ShipTools collects minimal, anonymous telemetry to understand which tools 
are useful and where visitors come from. Here is the **complete** list:

| What We Track | What We DON'T Track |
|--------------|-------------------|
| Which tool was opened | File names, sizes, contents |
| Whether a tool was used (yes/no) | What was converted or processed |
| Country (2-letter code, IP discarded) | IP addresses |
| Device type (desktop/mobile/tablet) | Browser, OS, screen size |
| Referrer domain (e.g., "twitter.com") | Full referrer URL or path |
| Session duration | Cross-session identity |
| Audit domain scanned | Any user-generated content |

**7 events total. No cookies. No fingerprinting. No cross-session tracking.**

### Opt out

Toggle in the footer, or run in your browser console:
```js
localStorage.setItem('st_telemetry_opt_out', 'true')
```

When opted out, **zero** analytics events are sent. Not reduced — zero.

### Audit the code

The entire analytics module is in [`src/lib/analytics/`](./src/lib/analytics/).
The event receiver is in [`src/app/api/analytics/event/route.ts`](./src/app/api/analytics/event/route.ts).

Found something we should change? [Open an issue](../../issues).

### See what we collect

Visit [shiptools.dev/transparency](https://shiptools.dev/transparency) for:
- The exact event schema with examples
- A live preview of events your session generates
- Aggregated public stats
- Side-by-side comparison with typical free tool tracking
```
