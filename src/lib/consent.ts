const STORAGE_KEY = "ul_analytics_consent";
const LEGACY_KEY = "bs_analytics_consent";

// Migrate legacy key on load
if (typeof window !== "undefined") {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, legacy);
  }
  if (legacy) localStorage.removeItem(LEGACY_KEY);
}

export type ConsentStatus = "accepted" | "declined" | "unknown";

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return "unknown";
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "accepted" || value === "declined") return value;
  return "unknown";
}

export function setConsentStatus(status: "accepted" | "declined"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, status);
}

export function hasOptedOut(): boolean {
  return getConsentStatus() === "declined";
}
