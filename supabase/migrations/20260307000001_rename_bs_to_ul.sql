-- Migration: Rename bs_ prefix to ul_ (BrowserShip → Uploadless)
-- Metadata-only operation — zero data migration, zero downtime.
-- Run via `supabase db push` BEFORE deploying new code.

-- 1. Rename tables
ALTER TABLE bs_audits RENAME TO ul_audits;
ALTER TABLE bs_audit_requests RENAME TO ul_audit_requests;
ALTER TABLE bs_analytics_events RENAME TO ul_analytics_events;
ALTER TABLE bs_analytics_daily RENAME TO ul_analytics_daily;

-- 2. Rename indexes
ALTER INDEX idx_bs_audits_domain RENAME TO idx_ul_audits_domain;
ALTER INDEX idx_bs_audits_expires RENAME TO idx_ul_audits_expires;
ALTER INDEX idx_bs_audit_requests_domain RENAME TO idx_ul_audit_requests_domain;
ALTER INDEX idx_bs_analytics_event RENAME TO idx_ul_analytics_event;
ALTER INDEX idx_bs_analytics_created RENAME TO idx_ul_analytics_created;
ALTER INDEX idx_bs_analytics_events_session_id RENAME TO idx_ul_analytics_events_session_id;
ALTER INDEX idx_bs_analytics_events_country RENAME TO idx_ul_analytics_events_country;
ALTER INDEX idx_bs_events_referrer RENAME TO idx_ul_events_referrer;
ALTER INDEX idx_bs_events_device RENAME TO idx_ul_events_device;

-- 3. Rename constraints
ALTER TABLE ul_analytics_daily RENAME CONSTRAINT bs_analytics_daily_unique
  TO ul_analytics_daily_unique;
