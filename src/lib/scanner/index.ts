import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import type { ScanData } from "../types";
import { classifyCookies, isThirdPartyDomain, detectServerSideProcessing } from "./classify";
import { classifyDomains } from "./trackers";
import { PAGE_TIMEOUT_MS } from "../constants";

/**
 * Launch a headless Chromium browser via @sparticuz/chromium.
 * On Vercel serverless, this decompresses the Chromium binary (~5-8s cold start).
 * Locally, falls back to system Chrome if available.
 */
async function getBrowser() {
  const executablePath = await chromium.executablePath();
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
}

/**
 * Scan a URL for privacy metrics:
 * 1. Launch headless Chromium
 * 2. Intercept all network requests — log third-party domains
 * 3. Block images/fonts/media for speed
 * 4. Navigate with networkidle2
 * 5. Extract cookies
 * 6. Classify domains against tracker database
 */
export async function scanUrl(url: string): Promise<ScanData> {
  const browser = await getBrowser();
  const thirdPartyRequests = new Set<string>();
  let pageDomain: string;

  try {
    pageDomain = new URL(url).hostname;
    const page = await browser.newPage();

    // Block heavy resources for speed
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "font", "media", "stylesheet"].includes(resourceType)) {
        req.abort();
        return;
      }

      // Log third-party domains
      try {
        const reqHost = new URL(req.url()).hostname;
        if (isThirdPartyDomain(reqHost, pageDomain)) {
          thirdPartyRequests.add(reqHost);
        }
      } catch {
        // Invalid URL — skip
      }

      req.continue();
    });

    // Navigate
    const startTime = Date.now();
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    const loadTimeMs = Date.now() - startTime;

    // Wait a bit for lazy-loaded trackers
    await new Promise((r) => setTimeout(r, 2000));

    // Extract cookies
    const rawCookies = await page.cookies();
    const cookies = classifyCookies(rawCookies, pageDomain);
    const thirdPartyDomainsList = Array.from(thirdPartyRequests).sort();

    // Classify trackers
    const trackers = classifyDomains(thirdPartyDomainsList);

    // Server-side processing heuristic
    const serverSideProcessing = detectServerSideProcessing(thirdPartyDomainsList);

    return {
      url,
      domain: pageDomain,
      scannedAt: new Date().toISOString(),
      loadTimeMs,
      cookies: {
        total: cookies.length,
        firstParty: cookies.filter((c) => !c.thirdParty).length,
        thirdParty: cookies.filter((c) => c.thirdParty).length,
        items: cookies,
      },
      thirdPartyDomains: {
        total: thirdPartyDomainsList.length,
        items: thirdPartyDomainsList,
      },
      trackers,
      serverSideProcessing,
    };
  } finally {
    await browser.close();
  }
}
