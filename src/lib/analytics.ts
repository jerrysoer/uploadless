"use client";

import type { AnalyticsEvent, AnalyticsEventName } from "./types";
import { hasOptedOut } from "./consent";

const SESSION_KEY = "bs_session_id";
const LEGACY_SESSION_KEY = "sl_session_id";

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "unknown";

  // Migrate legacy key
  const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY);
  if (legacy && !sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, legacy);
  }
  if (legacy) sessionStorage.removeItem(LEGACY_SESSION_KEY);

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Extract hostname from document.referrer, return "direct" for empty/same-origin. */
function getReferrerDomain(): string {
  if (typeof document === "undefined" || !document.referrer) return "direct";
  try {
    const ref = new URL(document.referrer);
    if (ref.hostname === window.location.hostname) return "direct";
    return ref.hostname;
  } catch {
    return "direct";
  }
}

/** Classify device by viewport width: mobile (<768), tablet (768–1024), desktop (>1024). */
function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w <= 1024) return "tablet";
  return "desktop";
}

// ─── Event emitter for transparency live preview ────────
type AnalyticsListener = (event: AnalyticsEvent, wouldSend: boolean) => void;
const listeners = new Set<AnalyticsListener>();

/** Subscribe to every trackEvent call (fires even when opted out). Returns unsubscribe fn. */
export function onAnalyticsEvent(listener: AnalyticsListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Fire-and-forget event tracking.
 * Sends to /api/analytics/event — never blocks UI.
 */
export function trackEvent(
  event: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>
) {
  const optedOut = hasOptedOut();

  const payload: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    referrer_domain: getReferrerDomain(),
    device_type: getDeviceType(),
  };

  // Notify all listeners (transparency preview) regardless of opt-out
  for (const listener of listeners) {
    try {
      listener(payload, !optedOut);
    } catch {
      // Never let listener errors break tracking
    }
  }

  if (optedOut) return;

  // navigator.sendBeacon is fire-and-forget, survives page unloads
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics/event",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
  } else {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Swallow — analytics should never break the app
    });
  }
}
