import { test, expect } from "@playwright/test";

/**
 * Verifies no unexpected console errors on critical pages.
 * Filters out known non-critical messages (favicon, WebGPU availability, resource loading).
 */

const CRITICAL_PAGES = ["/write", "/tools", "/media", "/protect", "/ai/models"];

const KNOWN_NOISE = [
  "favicon",
  "WebGPU",
  "Failed to load resource",
  "Download the React DevTools",
  "next-dev.js",
];

function isNoise(msg: string): boolean {
  return KNOWN_NOISE.some((n) => msg.includes(n));
}

for (const route of CRITICAL_PAGES) {
  test(`${route} has no unexpected console errors`, async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" && !isNoise(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto(route, { waitUntil: "load" });
    // Allow time for async scripts to execute and potentially log errors
    await page.waitForTimeout(2_000);

    expect(errors).toEqual([]);
  });
}
