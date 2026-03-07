import { test, expect } from "@playwright/test";

test.describe("Security Headers (COOP/COEP)", () => {
  const AI_ROUTES = ["/ai/transcribe", "/ai/background-removal", "/ai/ocr"];

  for (const route of AI_ROUTES) {
    test(`${route} has COOP same-origin header`, async ({ page }) => {
      const response = await page.goto(route);
      const coop = response?.headers()["cross-origin-opener-policy"];
      expect(coop).toBe("same-origin");
    });

    test(`${route} has COEP require-corp header`, async ({ page }) => {
      const response = await page.goto(route);
      const coep = response?.headers()["cross-origin-embedder-policy"];
      expect(coep).toBe("require-corp");
    });
  }

  test("/ai/models has COOP/COEP headers", async ({ page }) => {
    const response = await page.goto("/ai/models");
    expect(response?.headers()["cross-origin-opener-policy"]).toBe(
      "same-origin"
    );
    expect(response?.headers()["cross-origin-embedder-policy"]).toBe(
      "require-corp"
    );
  });
});
