-- Rebrand: ShipTools → ShipLocal — rename all st_ prefixed tables/indexes to sl_
-- This is a metadata-only operation (instant, no data copy)

-- Tables
ALTER TABLE st_audits RENAME TO sl_audits;
ALTER TABLE st_audit_requests RENAME TO sl_audit_requests;
ALTER TABLE st_analytics_events RENAME TO sl_analytics_events;
ALTER TABLE st_analytics_daily RENAME TO sl_analytics_daily;

-- Indexes
ALTER INDEX idx_st_audits_domain RENAME TO idx_sl_audits_domain;
ALTER INDEX idx_st_audits_expires RENAME TO idx_sl_audits_expires;
ALTER INDEX idx_st_audit_requests_domain RENAME TO idx_sl_audit_requests_domain;
ALTER INDEX idx_st_analytics_event RENAME TO idx_sl_analytics_event;
ALTER INDEX idx_st_analytics_created RENAME TO idx_sl_analytics_created;
ALTER INDEX idx_st_analytics_events_session_id RENAME TO idx_sl_analytics_events_session_id;
ALTER INDEX idx_st_analytics_events_country RENAME TO idx_sl_analytics_events_country;
