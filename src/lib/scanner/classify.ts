import type { CookieInfo } from "../types";

/**
 * Extract the registrable domain (eTLD+1) from a full hostname.
 * Simplified — handles common TLDs. For production, use a proper PSL library.
 */
export function getBaseDomain(hostname: string): string {
  const parts = hostname.replace(/\.$/, "").split(".");
  if (parts.length <= 2) return hostname;

  // Handle common double TLDs (co.uk, com.au, etc.)
  const doubleTlds = ["co.uk", "com.au", "co.nz", "co.jp", "com.br", "co.in"];
  const last2 = parts.slice(-2).join(".");
  if (doubleTlds.includes(last2) && parts.length > 2) {
    return parts.slice(-3).join(".");
  }

  return parts.slice(-2).join(".");
}

/**
 * Determine if a cookie is third-party relative to the scanned domain.
 */
export function isThirdPartyCookie(
  cookie: { domain: string },
  pageDomain: string
): boolean {
  const cookieDomain = cookie.domain.replace(/^\./, "");
  const pageBase = getBaseDomain(pageDomain);
  const cookieBase = getBaseDomain(cookieDomain);
  return pageBase !== cookieBase;
}

/**
 * Classify raw Puppeteer cookies into structured CookieInfo.
 */
export function classifyCookies(
  rawCookies: Array<{
    name: string;
    domain: string;
    path: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
    expires?: number;
  }>,
  pageDomain: string
): CookieInfo[] {
  return rawCookies.map((c) => ({
    name: c.name,
    domain: c.domain,
    path: c.path,
    secure: c.secure ?? false,
    httpOnly: c.httpOnly ?? false,
    sameSite: c.sameSite ?? "None",
    expires: c.expires ?? -1,
    thirdParty: isThirdPartyCookie(c, pageDomain),
  }));
}

/**
 * Determine if a request domain is third-party relative to the page.
 */
export function isThirdPartyDomain(
  requestDomain: string,
  pageDomain: string
): boolean {
  return getBaseDomain(requestDomain) !== getBaseDomain(pageDomain);
}

/**
 * Heuristic: does the site appear to process files server-side?
 * Checks for upload endpoints and file processing indicators.
 */
export function detectServerSideProcessing(domains: string[]): boolean {
  const uploadPatterns = [
    /upload/i,
    /convert/i,
    /process/i,
    /api.*file/i,
    /s3\.amazonaws\.com/i,
    /storage\.googleapis\.com/i,
    /blob\.core\.windows\.net/i,
  ];

  return domains.some((d) =>
    uploadPatterns.some((p) => p.test(d))
  );
}
