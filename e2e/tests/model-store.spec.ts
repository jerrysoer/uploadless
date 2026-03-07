import { test, expect } from "@playwright/test";
import { ModelStorePage } from "../pages/model-store.page";

test.describe("Model Store (F6)", () => {
  let storePage: ModelStorePage;

  test.beforeEach(async ({ page }) => {
    storePage = new ModelStorePage(page);
    await storePage.goto();
  });

  test("displays page heading", async () => {
    await expect(storePage.heading).toContainText("Model Store", {
      ignoreCase: true,
    });
  });

  // WebGPU-dependent sections: only visible when browser supports WebGPU.
  // Headless WebKit (iPhone 13 mobile project) does NOT have WebGPU,
  // so these elements won't render. We check for either content OR the
  // "WebGPU not available" fallback.

  test("shows WebLLM packs or WebGPU warning", async ({ page }) => {
    const hasPacks = await storePage.webllmSection.isVisible().catch(() => false);
    const hasWarning = await page.getByText("WebGPU not available").isVisible().catch(() => false);
    expect(hasPacks || hasWarning).toBe(true);
  });

  test("shows storage meter or WebGPU warning", async ({ page }) => {
    const hasMeter = await storePage.storageMeter.isVisible().catch(() => false);
    const hasWarning = await page.getByText("WebGPU not available").isVisible().catch(() => false);
    expect(hasMeter || hasWarning).toBe(true);
  });

  test("shows Ollama section", async () => {
    await expect(storePage.ollamaSection).toBeVisible();
  });

  test("renders action buttons when WebGPU supported", async ({ page }) => {
    const hasWebGPU = await storePage.webllmSection.isVisible().catch(() => false);
    if (!hasWebGPU) {
      // No WebGPU — no model packs rendered, skip assertion
      test.skip();
      return;
    }
    const count = await storePage.getActionButtonCount();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("shows capability badges when WebGPU supported", async ({ page }) => {
    const hasWebGPU = await storePage.webllmSection.isVisible().catch(() => false);
    if (!hasWebGPU) {
      test.skip();
      return;
    }
    await expect(storePage.capabilityBadges.first()).toBeVisible();
  });

  test("each model pack shows a size label when WebGPU supported", async ({
    page,
  }) => {
    const hasWebGPU = await storePage.webllmSection.isVisible().catch(() => false);
    if (!hasWebGPU) {
      test.skip();
      return;
    }
    const sizeLabels = page.getByText(/~\d+(\.\d+)?\s*(MB|GB)/);
    await expect(sizeLabels.first()).toBeVisible();
    expect(await sizeLabels.count()).toBeGreaterThanOrEqual(5);
  });
});
