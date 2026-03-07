-- Migration: Rename sl_ prefix to bs_ (ShipLocal → BrowserShip)
-- This is a metadata-only operation — zero data migration, zero downtime.
-- Run via `supabase db push` BEFORE deploying new code.

-- 1. Rename tables
ALTER TABLE sl_audits RENAME TO bs_audits;
ALTER TABLE sl_audit_requests RENAME TO bs_audit_requests;
ALTER TABLE sl_analytics_events RENAME TO bs_analytics_events;
ALTER TABLE sl_analytics_daily RENAME TO bs_analytics_daily;

-- 2. Rename indexes (from create_st_audits → rename_st_to_sl)
ALTER INDEX idx_sl_audits_domain RENAME TO idx_bs_audits_domain;
ALTER INDEX idx_sl_audits_expires RENAME TO idx_bs_audits_expires;

-- (from create_st_audit_requests → rename_st_to_sl)
ALTER INDEX idx_sl_audit_requests_domain RENAME TO idx_bs_audit_requests_domain;

-- (from create_st_analytics → rename_st_to_sl)
ALTER INDEX idx_sl_analytics_event RENAME TO idx_bs_analytics_event;
ALTER INDEX idx_sl_analytics_created RENAME TO idx_bs_analytics_created;

-- (from add_analytics_session_country → rename_st_to_sl)
ALTER INDEX idx_sl_analytics_events_session_id RENAME TO idx_bs_analytics_events_session_id;
ALTER INDEX idx_sl_analytics_events_country RENAME TO idx_bs_analytics_events_country;

-- (from add_referrer_device)
ALTER INDEX idx_sl_events_referrer RENAME TO idx_bs_events_referrer;
ALTER INDEX idx_sl_events_device RENAME TO idx_bs_events_device;

-- 3. Rename constraints
ALTER TABLE bs_analytics_daily RENAME CONSTRAINT sl_analytics_daily_unique
  TO bs_analytics_daily_unique;
