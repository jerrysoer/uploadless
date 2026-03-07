# BrowserShip Rename Guide

**From:** ShipLocal / ShipTools / ShipSafe
**To:** BrowserShip
**Domain:** browsership.dev
**Table Prefix:** `sl_` → `bs_`
**Date:** March 6, 2026

This document covers every surface that needs updating when renaming the project. Work through it top-to-bottom — infrastructure first, then code, then content.

---

## 1. Domain & DNS

### Purchase
- [ ] Buy `browsership.dev` (primary — Google Domains / Namecheap / Porkbun)
- [ ] Buy `browsership.sh` (backup/redirect — hacker-friendly TLD)
- [ ] Optional: `browsership.com` if available (defensive registration)

### Verify before buying
```bash
dig browsership.dev +short
dig browsership.sh +short
dig browsership.com +short
```

If any return an IP, the domain is taken. Empty response = likely available.

### DNS Configuration
Once purchased, point to Vercel:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

---

## 2. GitHub

### Rename Repository
1. Go to **Settings** → **General** → **Repository name**
2. Change from current repo name to `browsership`
3. GitHub auto-redirects old URLs, but update all local clones:

```bash
# Update remote URL in every local clone
cd ~/path-to-project
git remote set-url origin git@github.com:jerrysoer/browsership.git
```

### Update repo metadata
- [ ] **Description:** "Privacy auditor + 38 local-first browser tools. Zero uploads, zero trackers."
- [ ] **Website:** `https://browsership.dev`
- [ ] **Topics:** `privacy`, `browser-tools`, `wasm`, `local-first`, `file-converter`, `nextjs`, `typescript`

### Update all GitHub references in code
```bash
# Find all GitHub URL references
grep -rn "jerrysoer/shiplocal\|jerrysoer/shiptools\|jerrysoer/ship-local\|jerrysoer/ship-tools" src/ --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"
```

Replace with `jerrysoer/browsership` everywhere.

---

## 3. Vercel

### Option A: Rename existing project
1. Go to **Vercel Dashboard** → Project → **Settings** → **General**
2. Change **Project Name** to `browsership`
3. This gives you `browsership.vercel.app` as the preview URL

### Option B: Create new project (cleaner)
If `shiplocal.vercel.app` was already taken by someone else, creating a fresh project is simpler:
1. Import `jerrysoer/browsership` repo
2. Set project name to `browsership`
3. Configure environment variables (see Section 7)

### Custom domain
1. Go to **Settings** → **Domains**
2. Add `browsership.dev`
3. Add `www.browsership.dev` → redirect to `browsership.dev`
4. Remove any old domains (`shiplocal.*`, `shiptools.*`)

### Update vercel.json
```json
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

No name-specific changes needed in vercel.json — it's route-based.

---

## 4. Supabase — Table Prefix Migration (`sl_` → `bs_`)

### Why
Every project in the Ship ecosystem has a unique table prefix. BrowserShip gets `bs_`.

### Migration SQL

Run this in Supabase SQL Editor. **Back up first.**

```sql
-- ============================================
-- BrowserShip Table Prefix Migration: sl_ → bs_
-- ============================================

-- Step 1: Rename tables
ALTER TABLE sl_audits RENAME TO bs_audits;
ALTER TABLE sl_audit_requests RENAME TO bs_audit_requests;
ALTER TABLE sl_analytics_events RENAME TO bs_analytics_events;
ALTER TABLE sl_analytics_daily RENAME TO bs_analytics_daily;

-- Step 2: Rename domain columns in bs_audits
ALTER TABLE bs_audits RENAME COLUMN sl_domain TO bs_domain;
ALTER TABLE bs_audits RENAME COLUMN sl_url TO bs_url;
ALTER TABLE bs_audits RENAME COLUMN sl_grade TO bs_grade;
ALTER TABLE bs_audits RENAME COLUMN sl_score TO bs_score;
ALTER TABLE bs_audits RENAME COLUMN sl_cookies_total TO bs_cookies_total;
ALTER TABLE bs_audits RENAME COLUMN sl_cookies_first_party TO bs_cookies_first_party;
ALTER TABLE bs_audits RENAME COLUMN sl_cookies_third_party TO bs_cookies_third_party;
ALTER TABLE bs_audits RENAME COLUMN sl_third_party_domains TO bs_third_party_domains;
ALTER TABLE bs_audits RENAME COLUMN sl_third_party_domain_list TO bs_third_party_domain_list;
ALTER TABLE bs_audits RENAME COLUMN sl_trackers TO bs_trackers;
ALTER TABLE bs_audits RENAME COLUMN sl_session_recording_detected TO bs_session_recording_detected;
ALTER TABLE bs_audits RENAME COLUMN sl_ad_networks_detected TO bs_ad_networks_detected;
ALTER TABLE bs_audits RENAME COLUMN sl_server_side_processing TO bs_server_side_processing;
ALTER TABLE bs_audits RENAME COLUMN sl_ssl TO bs_ssl;
ALTER TABLE bs_audits RENAME COLUMN sl_scan_duration_ms TO bs_scan_duration_ms;
ALTER TABLE bs_audits RENAME COLUMN sl_scan_error TO bs_scan_error;
ALTER TABLE bs_audits RENAME COLUMN sl_favicon_url TO bs_favicon_url;
ALTER TABLE bs_audits RENAME COLUMN sl_scan_data TO bs_scan_data;

-- Step 3: Rename domain columns in bs_audit_requests
ALTER TABLE bs_audit_requests RENAME COLUMN sl_requested_domain TO bs_requested_domain;
ALTER TABLE bs_audit_requests RENAME COLUMN sl_requested_by_ip TO bs_requested_by_ip;
ALTER TABLE bs_audit_requests RENAME COLUMN sl_upvotes TO bs_upvotes;
ALTER TABLE bs_audit_requests RENAME COLUMN sl_status TO bs_status;

-- Step 4: Rename domain columns in bs_analytics_events
ALTER TABLE bs_analytics_events RENAME COLUMN sl_session_id TO bs_session_id;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_event_type TO bs_event_type;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_event_name TO bs_event_name;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_page_path TO bs_page_path;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_referrer TO bs_referrer;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_properties TO bs_properties;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_device_type TO bs_device_type;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_country TO bs_country;
ALTER TABLE bs_analytics_events RENAME COLUMN sl_duration_ms TO bs_duration_ms;

-- Step 5: Rename domain columns in bs_analytics_daily
ALTER TABLE bs_analytics_daily RENAME COLUMN sl_date TO bs_date;
ALTER TABLE bs_analytics_daily RENAME COLUMN sl_metric TO bs_metric;
ALTER TABLE bs_analytics_daily RENAME COLUMN sl_value TO bs_value;
ALTER TABLE bs_analytics_daily RENAME COLUMN sl_dimensions TO bs_dimensions;

-- Step 6: Rename indexes and constraints
-- (Postgres renames these automatically with table rename for most cases,
--  but explicitly rename any custom ones)
ALTER INDEX IF EXISTS sl_audits_domain_recent RENAME TO bs_audits_domain_recent;
ALTER INDEX IF EXISTS sl_audits_domain_idx RENAME TO bs_audits_domain_idx;

-- Step 7: Update RLS policies (drop and recreate with new table names)
-- List existing policies first:
-- SELECT * FROM pg_policies WHERE tablename LIKE 'bs_%';
-- Then recreate each policy referencing the new table names.
-- Example:
-- DROP POLICY IF EXISTS "sl_audits_public_read" ON bs_audits;
-- CREATE POLICY "bs_audits_public_read" ON bs_audits FOR SELECT USING (true);

-- Step 8: Verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'bs_%'
ORDER BY table_name;
```

### Important Notes
- If any columns don't exist (naming may vary from PRD versions), skip those ALTER lines
- Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'sl_audits';` first to see actual column names
- The `st_` prefix (from ShipTools era) may still exist if the `st_` → `sl_` migration was never fully completed — check for `st_` tables too

---

## 5. Codebase — Find and Replace

### Global text replacements

Run these sed commands from the project root. **Review diffs before committing.**

```bash
# Product name replacements (case-sensitive)
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.css" \) \
  -exec sed -i '' 's/ShipLocal/BrowserShip/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.css" \) \
  -exec sed -i '' 's/shiplocal/browsership/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.css" \) \
  -exec sed -i '' 's/ShipTools/BrowserShip/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.css" \) \
  -exec sed -i '' 's/shiptools/browsership/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.css" \) \
  -exec sed -i '' 's/ShipSafe/BrowserShip/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.css" \) \
  -exec sed -i '' 's/shipsafe/browsership/g' {} +

# Table prefix replacement (sl_ → bs_)
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.sql" \) \
  -exec sed -i '' 's/sl_/bs_/g' {} +

# Also catch any leftover st_ prefixes from ShipTools era
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.sql" \) \
  -exec sed -i '' 's/st_/bs_/g' {} +

# Domain replacements
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" \) \
  -exec sed -i '' 's/shiplocal\.dev/browsership.dev/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" \) \
  -exec sed -i '' 's/shiptools\.dev/browsership.dev/g' {} +

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" \) \
  -exec sed -i '' 's/shipsafe\.dev/browsership.dev/g' {} +
```

### macOS vs Linux note
The `sed -i ''` syntax is macOS. On Linux, use `sed -i` (no empty quotes).

### Verify no stragglers
```bash
grep -rn "ShipLocal\|shiplocal\|ShipTools\|shiptools\|ShipSafe\|shipsafe\|sl_\|st_" src/ \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" --include="*.css"
```

---

## 6. Specific Files to Update

### package.json
```json
{
  "name": "browsership",
  "description": "Privacy auditor + local-first browser tools. Zero uploads, zero trackers.",
  "homepage": "https://browsership.dev",
  "repository": {
    "type": "git",
    "url": "https://github.com/jerrysoer/browsership"
  }
}
```

### README.md
- [ ] Title: `# BrowserShip`
- [ ] Tagline: update to BrowserShip positioning
- [ ] All URLs to `browsership.dev`
- [ ] GitHub badge URLs to `jerrysoer/browsership`
- [ ] Any shields.io badges referencing the old name

### CLAUDE.md
- [ ] Project name header
- [ ] Table prefix reference: `bs_`
- [ ] Domain references
- [ ] Any positioning/product description text

### src/app/layout.tsx (or root layout)
```tsx
// Update metadata
export const metadata = {
  title: 'BrowserShip — Privacy Auditor & Local Browser Tools',
  description: 'Audit any tool\'s privacy practices. Convert files 100% in your browser. Zero uploads, zero trackers.',
  metadataBase: new URL('https://browsership.dev'),
  openGraph: {
    title: 'BrowserShip',
    description: 'Privacy auditor + 38 local-first browser tools',
    url: 'https://browsership.dev',
    siteName: 'BrowserShip',
    // ...
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrowserShip',
    // ...
  }
}
```

### OG Image / Report Card
- [ ] Update "Scanned by ShipLocal" → "Scanned by BrowserShip" in OG image generation
- [ ] Update `/api/og/[domain]/route.tsx` (or wherever OG images are rendered)
- [ ] Favicon: update if it contains text

### Analytics Events
Search for any hardcoded event names containing the old brand:
```bash
grep -rn "shiplocal\|shiptools\|shipsafe" src/lib/analytics/ --include="*.ts"
```

The `bs_` prefix should handle table/column names, but check event string values too.

### Telemetry / Consent Banner
- [ ] Update any copy mentioning "ShipLocal telemetry" → "BrowserShip telemetry"
- [ ] localStorage key: if using `st_telemetry_opt_out` or `sl_telemetry_opt_out`, migrate to `bs_telemetry_opt_out`

```typescript
// Migration helper — add to app initialization once
const oldKeys = ['st_telemetry_opt_out', 'sl_telemetry_opt_out'];
oldKeys.forEach(key => {
  const val = localStorage.getItem(key);
  if (val) {
    localStorage.setItem('bs_telemetry_opt_out', val);
    localStorage.removeItem(key);
  }
});
```

### sessionStorage keys
Same pattern — migrate any `sl_session_id` → `bs_session_id`:
```bash
grep -rn "sl_session\|st_session" src/ --include="*.ts" --include="*.tsx"
```

---

## 7. Environment Variables

No variable names change (they're generic Supabase vars), but update values where the domain appears:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
NEXT_PUBLIC_SITE_URL=https://browsership.dev
```

### Vercel Environment Variables
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_SITE_URL` to `https://browsership.dev`
3. All other Supabase vars stay the same (same database, just renamed tables)

---

## 8. PRD Files

All PRDs in the project and outputs directory need updating. These are reference docs — do a bulk rename:

| Current File | New File |
|---|---|
| `ShipLocal-PRD.md` | `BrowserShip-PRD.md` |
| `ShipLocal-Phase2-PRD-v2.md` | `BrowserShip-Phase2-PRD-v2.md` |
| `ShipLocal-Phase3-Record-Capture-PRD.md` | `BrowserShip-Phase3-Record-Capture-PRD.md` |
| `ShipLocal-WebLLM-Feature-Map.md` | `BrowserShip-WebLLM-Feature-Map.md` |
| `ShipTools-Analytics-PRD-v2.md` | `BrowserShip-Analytics-PRD-v2.md` |
| `ShipTools-Browser-Tool-Map.md` | `BrowserShip-Browser-Tool-Map.md` |
| `ShipTools-Extended-Ideas.md` | `BrowserShip-Extended-Ideas.md` |

Within each file:
```bash
for f in *ShipLocal* *ShipTools* *ShipSafe*; do
  newname=$(echo "$f" | sed 's/ShipLocal/BrowserShip/g; s/ShipTools/BrowserShip/g; s/ShipSafe/BrowserShip/g')
  mv "$f" "$newname"
  sed -i '' 's/ShipLocal/BrowserShip/g; s/shiplocal/browsership/g; s/ShipTools/BrowserShip/g; s/shiptools/browsership/g; s/ShipSafe/BrowserShip/g; s/shipsafe/browsership/g; s/sl_/bs_/g; s/st_/bs_/g; s/sf_/bs_/g' "$newname"
done
```

---

## 9. GTM & Positioning Updates

### Updated Positioning Statement
```
FOR developers and technical builders
WHO use free online tools daily without realizing they're tracked by hundreds of ad networks
BROWSERSHIP IS A privacy auditor and local-first browser toolkit
THAT audits any tool's privacy practices and gives you the safe alternative — 38+ tools running 100% in your browser
UNLIKE browser-based tools that process files on remote servers surrounded by tracking infrastructure
OUR PRODUCT runs everything locally — zero uploads, zero trackers, zero cookies
```

### Updated One-Liner
"BrowserShip audits the privacy cost of free online tools — and gives you the local alternative."

### Updated Narrative Hook
"A Reddit post revealed that iLovePDF sets 637 cookies from 221 domains when you upload a single document. So I built BrowserShip — it scans any free tool's privacy practices and gives you 38+ tools that run entirely in your browser. Your files never leave your device."

### Share Text Templates
Update in the codebase wherever share text is generated:
```
// Audit share
"🔍 {domain} gets a {grade} on BrowserShip's privacy audit. {cookieCount} cookies from {domainCount} domains.\n\nScan any tool → browsership.dev"

// Converter share  
"Just converted {fileType} 100% in my browser with BrowserShip. Zero uploads, zero trackers.\n\nbrowsership.dev"
```

---

## 10. Ship Ecosystem Context

### Memory/CLAUDE.md Ecosystem Reference
Update the project listing wherever the Ship portfolio is documented:

**Old:**
```
- ShipLocal / ShipTools — Privacy auditor + browser-native toolkit
```

**New:**
```
- BrowserShip — Privacy auditor + 38 local-first browser tools (browsership.dev). Table prefix: bs_.
```

### Cross-Product References
If any other Ship project's CLAUDE.md or docs reference ShipLocal/ShipTools, update those too:
- ShipSignal CLAUDE.md
- ShipBoard CLAUDE.md  
- ShipRamp CLAUDE.md
- Any shared portfolio/landing pages

---

## 11. Execution Checklist (Ordered)

### Phase 1: Infrastructure (do first, before any code changes)
- [ ] Purchase `browsership.dev` domain
- [ ] Rename GitHub repo to `browsership`
- [ ] Update local git remotes
- [ ] Rename or create Vercel project as `browsership`
- [ ] Add custom domain `browsership.dev` in Vercel

### Phase 2: Database
- [ ] Run `SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'sl_%' OR table_name LIKE 'st_%';` to see current state
- [ ] Back up Supabase data
- [ ] Run migration SQL (Section 4) — rename tables and columns
- [ ] Verify with `SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'bs_%';`

### Phase 3: Codebase
- [ ] Run global find-and-replace (Section 5)
- [ ] Update `package.json` (Section 6)
- [ ] Update root layout metadata (Section 6)
- [ ] Update OG image generation
- [ ] Update consent/telemetry strings
- [ ] Migrate localStorage/sessionStorage keys
- [ ] Update `.env.local` SITE_URL
- [ ] Run straggler check: `grep -rn "ShipLocal\|shiplocal\|ShipTools\|shiptools\|ShipSafe\|shipsafe\|sl_\|st_\|sf_" src/`
- [ ] Build and verify: `npm run build`
- [ ] Test locally: `npm run dev`

### Phase 4: Content & Docs
- [ ] Rename and update all PRD files (Section 8)
- [ ] Update README.md
- [ ] Update CLAUDE.md
- [ ] Update GTM copy / positioning (Section 9)

### Phase 5: Deploy & Verify
- [ ] Push to main → Vercel auto-deploys
- [ ] Verify `browsership.dev` loads correctly
- [ ] Verify OG images show "BrowserShip" (test with opengraph.xyz)
- [ ] Verify audit URLs work: `browsership.dev/audit/{domain}`
- [ ] Verify analytics events write to `bs_analytics_events`
- [ ] Update Vercel environment variables if needed

### Phase 6: External References
- [ ] Update memory/preferences with new name
- [ ] Update any other Ship project CLAUDE.md files
- [ ] Update portfolio references
- [ ] If any live social posts link to old domain, set up redirects

---

## 12. Redirect Strategy (if old domains existed)

If `shiplocal.*` or `shiptools.*` domains were ever live and indexed:

```
# In old domain's DNS or hosting, add 301 redirects:
shiplocal.sh/* → browsership.dev/*
shiptools.dev/* → browsership.dev/*
```

If using Vercel for the old project, add redirect rules in `vercel.json` of the old project before sunsetting it.

---

## Summary

| Item | Old | New |
|------|-----|-----|
| Product name | ShipLocal / ShipTools / ShipSafe | **BrowserShip** |
| Domain | shiplocal.sh / shiptools.dev / shipsafe.dev | **browsership.dev** |
| GitHub repo | jerrysoer/shiplocal (or similar) | **jerrysoer/browsership** |
| Vercel project | shiplocal | **browsership** |
| Vercel URL | shiplocal.vercel.app | **browsership.vercel.app** |
| Table prefix | `sl_` / `st_` / `sf_` | **`bs_`** |
| localStorage keys | `sl_telemetry_opt_out` | **`bs_telemetry_opt_out`** |
| sessionStorage keys | `sl_session_id` | **`bs_session_id`** |
| OG branding | "Scanned by ShipLocal" | **"Scanned by BrowserShip"** |
| One-liner | varies | **"BrowserShip audits the privacy cost of free online tools — and gives you the local alternative."** |
