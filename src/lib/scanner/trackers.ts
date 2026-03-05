import type { TrackerMatch } from "../types";

type Category = TrackerMatch["category"];

interface TrackerEntry {
  pattern: RegExp;
  name: string;
  category: Category;
}

/**
 * Known tracker/ad/recorder database.
 * Patterns match against third-party request domains.
 */
const TRACKER_DB: TrackerEntry[] = [
  // --- Analytics ---
  { pattern: /google-analytics\.com/i, name: "Google Analytics", category: "analytics" },
  { pattern: /googletagmanager\.com/i, name: "Google Tag Manager", category: "analytics" },
  { pattern: /analytics\.google\.com/i, name: "Google Analytics", category: "analytics" },
  { pattern: /hotjar\.com/i, name: "Hotjar", category: "analytics" },
  { pattern: /mixpanel\.com/i, name: "Mixpanel", category: "analytics" },
  { pattern: /segment\.io/i, name: "Segment", category: "analytics" },
  { pattern: /segment\.com/i, name: "Segment", category: "analytics" },
  { pattern: /amplitude\.com/i, name: "Amplitude", category: "analytics" },
  { pattern: /heap\.io/i, name: "Heap", category: "analytics" },
  { pattern: /plausible\.io/i, name: "Plausible", category: "analytics" },
  { pattern: /matomo\./i, name: "Matomo", category: "analytics" },
  { pattern: /clarity\.ms/i, name: "Microsoft Clarity", category: "analytics" },
  { pattern: /newrelic\.com/i, name: "New Relic", category: "analytics" },
  { pattern: /sentry\.io/i, name: "Sentry", category: "analytics" },
  { pattern: /posthog\.com/i, name: "PostHog", category: "analytics" },
  { pattern: /rudderstack\.com/i, name: "RudderStack", category: "analytics" },

  // --- Advertising ---
  { pattern: /doubleclick\.net/i, name: "Google DoubleClick", category: "advertising" },
  { pattern: /googlesyndication\.com/i, name: "Google AdSense", category: "advertising" },
  { pattern: /googleadservices\.com/i, name: "Google Ads", category: "advertising" },
  { pattern: /google\.com\/pagead/i, name: "Google Ads", category: "advertising" },
  { pattern: /facebook\.net/i, name: "Meta Pixel", category: "advertising" },
  { pattern: /facebook\.com\/tr/i, name: "Meta Pixel", category: "advertising" },
  { pattern: /connect\.facebook/i, name: "Meta SDK", category: "advertising" },
  { pattern: /ads-twitter\.com/i, name: "Twitter Ads", category: "advertising" },
  { pattern: /analytics\.tiktok\.com/i, name: "TikTok Pixel", category: "advertising" },
  { pattern: /snap\.licdn\.com/i, name: "LinkedIn Insight", category: "advertising" },
  { pattern: /ads\.linkedin\.com/i, name: "LinkedIn Ads", category: "advertising" },
  { pattern: /criteo\.com/i, name: "Criteo", category: "advertising" },
  { pattern: /taboola\.com/i, name: "Taboola", category: "advertising" },
  { pattern: /outbrain\.com/i, name: "Outbrain", category: "advertising" },
  { pattern: /amazon-adsystem\.com/i, name: "Amazon Ads", category: "advertising" },
  { pattern: /adnxs\.com/i, name: "Xandr/AppNexus", category: "advertising" },
  { pattern: /rubiconproject\.com/i, name: "Rubicon", category: "advertising" },
  { pattern: /pubmatic\.com/i, name: "PubMatic", category: "advertising" },
  { pattern: /openx\.net/i, name: "OpenX", category: "advertising" },

  // --- Session Recording ---
  { pattern: /fullstory\.com/i, name: "FullStory", category: "session-recording" },
  { pattern: /mouseflow\.com/i, name: "Mouseflow", category: "session-recording" },
  { pattern: /smartlook\.com/i, name: "Smartlook", category: "session-recording" },
  { pattern: /logrocket\.com/i, name: "LogRocket", category: "session-recording" },
  { pattern: /inspectlet\.com/i, name: "Inspectlet", category: "session-recording" },
  { pattern: /crazyegg\.com/i, name: "Crazy Egg", category: "session-recording" },
  { pattern: /luckyorange\.com/i, name: "Lucky Orange", category: "session-recording" },
  { pattern: /heatmap\.com/i, name: "Heatmap", category: "session-recording" },

  // --- Social ---
  { pattern: /platform\.twitter\.com/i, name: "Twitter", category: "social" },
  { pattern: /platform\.linkedin\.com/i, name: "LinkedIn", category: "social" },
  { pattern: /apis\.google\.com/i, name: "Google APIs", category: "social" },
  { pattern: /accounts\.google\.com/i, name: "Google Sign-In", category: "social" },
];

/**
 * Classify a third-party domain against the tracker database.
 */
export function classifyDomain(domain: string): TrackerMatch | null {
  for (const entry of TRACKER_DB) {
    if (entry.pattern.test(domain)) {
      return { domain, name: entry.name, category: entry.category };
    }
  }
  return null;
}

/**
 * Classify all third-party domains, deduplicating by name + category.
 */
export function classifyDomains(domains: string[]): {
  analytics: TrackerMatch[];
  advertising: TrackerMatch[];
  sessionRecording: TrackerMatch[];
  social: TrackerMatch[];
} {
  const seen = new Set<string>();
  const result = {
    analytics: [] as TrackerMatch[],
    advertising: [] as TrackerMatch[],
    sessionRecording: [] as TrackerMatch[],
    social: [] as TrackerMatch[],
  };

  for (const domain of domains) {
    const match = classifyDomain(domain);
    if (!match) continue;

    const key = `${match.name}:${match.category}`;
    if (seen.has(key)) continue;
    seen.add(key);

    switch (match.category) {
      case "analytics":
        result.analytics.push(match);
        break;
      case "advertising":
        result.advertising.push(match);
        break;
      case "session-recording":
        result.sessionRecording.push(match);
        break;
      case "social":
        result.social.push(match);
        break;
    }
  }

  return result;
}
