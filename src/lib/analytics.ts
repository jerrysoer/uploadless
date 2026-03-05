"use client";

import type { AnalyticsEvent } from "./types";

/**
 * Fire-and-forget event tracking.
 * Sends to /api/analytics/event — never blocks UI.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  const payload: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

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
