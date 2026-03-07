import { test, expect } from "@playwright/test";

/**
 * Mobile responsiveness checks.
 * These tests only run in the "mobile" project (iPhone 13 viewport).
 * They verify pages render without horizontal overflow and
 * critical elements remain visible at 375px width.
 */

// Tag this entire describe block to only run in mobile project
test.describe("Responsive — Mobile (375px)", () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only tests");
  });

  test("AI Tools Hub is readable on mobile", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Tabs should be visible
    const tabs = page.locator("button").filter({ hasText: "Summarize" });
    await expect(tabs.first()).toBeVisible();

    // No horizontal overflow
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("Model Store is readable on mobile", async ({ page }) => {
    await page.goto("/ai/models");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("Dev tools page is readable on mobile", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("IP Calculator is usable on mobile", async ({ page }) => {
    await page.goto("/tools/ip-calc");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Input should be visible and tappable
    const input = page.getByRole("textbox").first();
    await expect(input).toBeVisible();
    await input.fill("10.0.0.0/24");

    await expect(page.getByText("254", { exact: true })).toBeVisible({
      timeout: 3_000,
    });
  });
});
