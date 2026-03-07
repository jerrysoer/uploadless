-- Migration: Rename sl_ prefix to bs_ (ShipLocal → BrowserShip)
-- This is a metadata-only operation — zero data migration, zero downtime.
-- Run via `supabase db push` BEFORE deploying new code.

-- 1. Rename tables
ALTER TABLE sl_audits RENAME TO bs_audits;
ALTER TABLE sl_audit_requests RENAME TO bs_audit_requests;
ALTER TABLE sl_analytics_events RENAME TO bs_analytics_events;
ALTER TABLE sl_analytics_daily RENAME TO bs_analytics_daily;

-- 2. Rename indexes
ALTER INDEX idx_sl_audits_domain RENAME TO idx_bs_audits_domain;
ALTER INDEX idx_sl_audits_expires RENAME TO idx_bs_audits_expires;
ALTER INDEX idx_sl_analytics_events_created RENAME TO idx_bs_analytics_events_created;
ALTER INDEX idx_sl_analytics_events_event RENAME TO idx_bs_analytics_events_event;
ALTER INDEX idx_sl_analytics_events_session RENAME TO idx_bs_analytics_events_session;
ALTER INDEX idx_sl_analytics_events_country RENAME TO idx_bs_analytics_events_country;
ALTER INDEX idx_sl_analytics_daily_date_event RENAME TO idx_bs_analytics_daily_date_event;

-- 3. Rename constraints (unique constraint on daily table)
ALTER TABLE bs_analytics_daily RENAME CONSTRAINT sl_analytics_daily_date_event_country_referrer_domain_devic_key
  TO bs_analytics_daily_date_event_country_referrer_domain_devic_key;
